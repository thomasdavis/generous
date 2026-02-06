import crypto from "node:crypto";
import { eq } from "drizzle-orm";
import { createApiToolExecutor, WorkflowEngine } from "@/lib/workflow/engine";
import type {
  ToolNode,
  WorkflowDefinition,
  WorkflowEdge,
  WorkflowVariable,
} from "@/lib/workflow/types";
import { getDb } from "@/server/db";
import {
  type NewWorkflowExecution,
  webhook,
  workflow,
  workflowExecution,
} from "@/server/db/schema";

// Verify webhook signature
function verifySignature(payload: string, signature: string, secret: string): boolean {
  const expectedSignature = crypto.createHmac("sha256", secret).update(payload).digest("hex");
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
}

// POST /api/webhooks/[id] - Trigger a workflow via webhook
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = getDb();

  // Find webhook
  const webhooks = await db.select().from(webhook).where(eq(webhook.url, id));
  if (webhooks.length === 0) {
    return Response.json({ error: "Webhook not found" }, { status: 404 });
  }

  const webhookRecord = webhooks[0];

  // Check if enabled
  if (!webhookRecord.isEnabled) {
    return Response.json({ error: "Webhook is disabled" }, { status: 400 });
  }

  // Get request body
  const bodyText = await req.text();
  let payload: unknown = {};
  try {
    payload = JSON.parse(bodyText);
  } catch {
    payload = { raw: bodyText };
  }

  // Verify signature if provided
  const signature = req.headers.get("x-webhook-signature");
  if (signature) {
    if (!verifySignature(bodyText, signature, webhookRecord.secret)) {
      return Response.json({ error: "Invalid signature" }, { status: 401 });
    }
  }

  // Find workflow
  const workflows = await db
    .select()
    .from(workflow)
    .where(eq(workflow.id, webhookRecord.workflowId));

  if (workflows.length === 0) {
    return Response.json({ error: "Workflow not found" }, { status: 404 });
  }

  const workflowRecord = workflows[0];

  // Check if workflow is enabled
  if (!workflowRecord.isEnabled) {
    return Response.json({ error: "Workflow is disabled" }, { status: 400 });
  }

  // Update last triggered
  await db
    .update(webhook)
    .set({ lastTriggered: new Date() })
    .where(eq(webhook.id, webhookRecord.id));

  // Create execution record
  const execution: NewWorkflowExecution = {
    id: crypto.randomUUID(),
    workflowId: workflowRecord.id,
    status: "pending",
    triggeredBy: "webhook",
    metadata: { webhookId: webhookRecord.id },
  };

  await db.insert(workflowExecution).values(execution);

  // Build workflow definition
  const workflowDef: WorkflowDefinition = {
    id: workflowRecord.id,
    name: workflowRecord.name,
    description: workflowRecord.description || undefined,
    nodes: workflowRecord.nodes as ToolNode[],
    edges: workflowRecord.edges as WorkflowEdge[],
    variables: Object.entries((workflowRecord.variables as Record<string, unknown>) || {}).map(
      ([name, defaultValue]) => ({
        name,
        type: typeof defaultValue as "string" | "number" | "boolean" | "object" | "array",
        defaultValue,
      }),
    ) as WorkflowVariable[],
  };

  // Create executor
  const toolExecutor = createApiToolExecutor();
  const engine = new WorkflowEngine(workflowDef, toolExecutor);

  try {
    // Update status to running
    await db
      .update(workflowExecution)
      .set({ status: "running", startedAt: new Date() })
      .where(eq(workflowExecution.id, execution.id));

    // Execute workflow with webhook payload
    const result = await engine.execute({
      type: "webhook",
      webhookPayload: payload,
      variables: { webhookPayload: payload },
    });

    // Update execution with results
    await db
      .update(workflowExecution)
      .set({
        status: result.status,
        completedAt: result.completedAt ? new Date(result.completedAt) : new Date(),
        nodeResults: result.nodeResults as Record<string, unknown>,
        error: result.error || null,
      })
      .where(eq(workflowExecution.id, execution.id));

    return Response.json({
      success: result.status === "completed",
      executionId: execution.id,
      status: result.status,
    });
  } catch (error) {
    // Update execution with error
    await db
      .update(workflowExecution)
      .set({
        status: "failed",
        completedAt: new Date(),
        error: error instanceof Error ? error.message : String(error),
      })
      .where(eq(workflowExecution.id, execution.id));

    return Response.json(
      {
        success: false,
        executionId: execution.id,
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
