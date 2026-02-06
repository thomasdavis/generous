import { desc, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { getDb } from "@/server/db";
import { workflow, workflowExecution } from "@/server/db/schema";

// GET /api/workflows/[id]/executions - Get execution history
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getDb();
  const url = new URL(req.url);
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "50", 10), 100);
  const offset = parseInt(url.searchParams.get("offset") || "0", 10);

  // Find workflow and check ownership
  const workflows = await db.select().from(workflow).where(eq(workflow.id, id));
  if (workflows.length === 0) {
    return Response.json({ error: "Workflow not found" }, { status: 404 });
  }

  const found = workflows[0];
  if (found.ownerId !== session.user.id) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  // Get executions
  const executions = await db
    .select()
    .from(workflowExecution)
    .where(eq(workflowExecution.workflowId, id))
    .orderBy(desc(workflowExecution.triggeredAt))
    .limit(limit)
    .offset(offset);

  // Get total count
  const allExecutions = await db
    .select()
    .from(workflowExecution)
    .where(eq(workflowExecution.workflowId, id));

  return Response.json({
    executions,
    total: allExecutions.length,
    limit,
    offset,
  });
}
