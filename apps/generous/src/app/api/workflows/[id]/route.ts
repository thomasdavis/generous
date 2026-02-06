import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { getDb } from "@/server/db";
import { workflow } from "@/server/db/schema";

// GET /api/workflows/[id] - Get a workflow
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getDb();

  const workflows = await db.select().from(workflow).where(eq(workflow.id, id));

  if (workflows.length === 0) {
    return Response.json({ error: "Workflow not found" }, { status: 404 });
  }

  const found = workflows[0];

  // Check ownership
  if (found.ownerId !== session.user.id) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  return Response.json(found);
}

// PATCH /api/workflows/[id] - Update a workflow
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getDb();
  const body = await req.json();

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

  // Update workflow
  const updates: Partial<typeof found> = {
    updatedAt: new Date(),
  };

  if (body.name !== undefined) updates.name = body.name;
  if (body.description !== undefined) updates.description = body.description;
  if (body.dashboardId !== undefined) updates.dashboardId = body.dashboardId;
  if (body.nodes !== undefined) updates.nodes = body.nodes;
  if (body.edges !== undefined) updates.edges = body.edges;
  if (body.variables !== undefined) updates.variables = body.variables;
  if (body.triggerConfig !== undefined) updates.triggerConfig = body.triggerConfig;
  if (body.isEnabled !== undefined) updates.isEnabled = body.isEnabled;

  await db.update(workflow).set(updates).where(eq(workflow.id, id));

  const updated = await db.select().from(workflow).where(eq(workflow.id, id));
  return Response.json(updated[0]);
}

// DELETE /api/workflows/[id] - Delete a workflow
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getDb();

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

  // Delete workflow (cascades to executions)
  await db.delete(workflow).where(eq(workflow.id, id));

  return Response.json({ success: true });
}
