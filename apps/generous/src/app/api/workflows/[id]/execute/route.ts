import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { createApiToolExecutor, WorkflowEngine } from "@/lib/workflow/engine";
import type {
  ToolNode,
  WorkflowDefinition,
  WorkflowEdge,
  WorkflowVariable,
} from "@/lib/workflow/types";
import { getDb } from "@/server/db";
import { type NewWorkflowExecution, workflow, workflowExecution } from "@/server/db/schema";

// POST /api/workflows/[id]/execute - Execute a workflow
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getDb();
  const body = await req.json().catch(() => ({}));

  // Find workflow
  const workflows = await db.select().from(workflow).where(eq(workflow.id, id));
  if (workflows.length === 0) {
    return Response.json({ error: "Workflow not found" }, { status: 404 });
  }

  const found = workflows[0];

  // Check ownership
  if (found.ownerId !== session.user.id) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  // Check if enabled
  if (!found.isEnabled) {
    return Response.json({ error: "Workflow is disabled" }, { status: 400 });
  }

  // Create execution record
  const execution: NewWorkflowExecution = {
    id: crypto.randomUUID(),
    workflowId: id,
    status: "pending",
    triggeredBy: "manual",
    metadata: { userId: session.user.id },
  };

  await db.insert(workflowExecution).values(execution);

  // Build workflow definition
  const workflowDef: WorkflowDefinition = {
    id: found.id,
    name: found.name,
    description: found.description || undefined,
    nodes: found.nodes as ToolNode[],
    edges: found.edges as WorkflowEdge[],
    variables: Object.entries((found.variables as Record<string, unknown>) || {}).map(
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

    // Execute workflow
    const result = await engine.execute({
      type: "manual",
      userId: session.user.id,
      variables: body.variables || {},
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
      executionId: execution.id,
      status: result.status,
      nodeResults: result.nodeResults,
      error: result.error,
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
        executionId: execution.id,
        status: "failed",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
