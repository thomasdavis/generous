import { and, eq, lte } from "drizzle-orm";
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
  scheduledJob,
  workflow,
  workflowExecution,
} from "@/server/db/schema";

// Vercel Cron job - runs every minute
// Configure in vercel.json: { "crons": [{ "path": "/api/cron", "schedule": "* * * * *" }] }

// Parse cron expression to get next run time
function getNextRunTime(cronExpression: string, _timezone: string = "UTC"): Date {
  const now = new Date();

  // Simple cron parser for common patterns
  if (cronExpression === "* * * * *") {
    return new Date(now.getTime() + 60 * 1000);
  } else if (cronExpression.startsWith("*/5")) {
    return new Date(now.getTime() + 5 * 60 * 1000);
  } else if (cronExpression.startsWith("*/15")) {
    return new Date(now.getTime() + 15 * 60 * 1000);
  } else if (cronExpression.startsWith("0 *")) {
    return new Date(now.getTime() + 60 * 60 * 1000);
  } else if (cronExpression.startsWith("0 0")) {
    const next = new Date(now);
    next.setHours(24, 0, 0, 0);
    return next;
  }

  // Default: next minute
  return new Date(now.getTime() + 60 * 1000);
}

export async function GET(req: Request) {
  // Verify cron secret if configured
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${cronSecret}`) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const db = getDb();
  const now = new Date();

  // Find all scheduled jobs where nextRun <= now and isEnabled
  const dueJobs = await db
    .select()
    .from(scheduledJob)
    .where(and(eq(scheduledJob.isEnabled, true), lte(scheduledJob.nextRun, now)));

  const results: Array<{
    jobId: string;
    workflowId: string;
    status: string;
    executionId?: string;
    error?: string;
  }> = [];

  for (const job of dueJobs) {
    try {
      // Find workflow
      const workflows = await db.select().from(workflow).where(eq(workflow.id, job.workflowId));

      if (workflows.length === 0) {
        results.push({
          jobId: job.id,
          workflowId: job.workflowId,
          status: "skipped",
          error: "Workflow not found",
        });
        continue;
      }

      const workflowRecord = workflows[0];

      // Check if workflow is enabled
      if (!workflowRecord.isEnabled) {
        results.push({
          jobId: job.id,
          workflowId: job.workflowId,
          status: "skipped",
          error: "Workflow is disabled",
        });
        continue;
      }

      // Update job: set lastRun and nextRun
      await db
        .update(scheduledJob)
        .set({
          lastRun: now,
          nextRun: getNextRunTime(job.cronExpression, job.timezone),
        })
        .where(eq(scheduledJob.id, job.id));

      // Create execution record
      const execution: NewWorkflowExecution = {
        id: crypto.randomUUID(),
        workflowId: workflowRecord.id,
        status: "pending",
        triggeredBy: "cron",
        metadata: { jobId: job.id, cronExpression: job.cronExpression },
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

      // Update status to running
      await db
        .update(workflowExecution)
        .set({ status: "running", startedAt: new Date() })
        .where(eq(workflowExecution.id, execution.id));

      // Execute workflow
      const result = await engine.execute({
        type: "cron",
        variables: {
          cronExpression: job.cronExpression,
          scheduledAt: now.toISOString(),
        },
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

      results.push({
        jobId: job.id,
        workflowId: job.workflowId,
        status: result.status,
        executionId: execution.id,
      });
    } catch (error) {
      results.push({
        jobId: job.id,
        workflowId: job.workflowId,
        status: "failed",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  return Response.json({
    processed: results.length,
    results,
    timestamp: now.toISOString(),
  });
}
