import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { getDb } from "@/server/db";
import { dashboard, toolspace } from "@/server/db/schema";

// Check ownership via dashboard
async function checkOwnership(toolspaceId: string, userId: string): Promise<boolean> {
  const db = getDb();

  const toolspaces = await db
    .select({
      toolspace: toolspace,
      dashboardOwnerId: dashboard.ownerId,
    })
    .from(toolspace)
    .innerJoin(dashboard, eq(toolspace.dashboardId, dashboard.id))
    .where(eq(toolspace.id, toolspaceId));

  if (toolspaces.length === 0) {
    return false;
  }

  return toolspaces[0].dashboardOwnerId === userId;
}

// GET /api/toolspaces/[id] - Get a toolspace
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getDb();

  const toolspaces = await db.select().from(toolspace).where(eq(toolspace.id, id));

  if (toolspaces.length === 0) {
    return Response.json({ error: "Toolspace not found" }, { status: 404 });
  }

  // Check ownership
  const isOwner = await checkOwnership(id, session.user.id);
  if (!isOwner) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  return Response.json(toolspaces[0]);
}

// PATCH /api/toolspaces/[id] - Update a toolspace
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getDb();
  const body = await req.json();

  // Check ownership
  const isOwner = await checkOwnership(id, session.user.id);
  if (!isOwner) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  // Get current toolspace
  const toolspaces = await db.select().from(toolspace).where(eq(toolspace.id, id));
  if (toolspaces.length === 0) {
    return Response.json({ error: "Toolspace not found" }, { status: 404 });
  }

  const current = toolspaces[0];

  // Update fields
  const updates: Partial<typeof current> = {};
  if (body.name !== undefined) updates.name = body.name;
  if (body.tools !== undefined) updates.tools = body.tools;
  if (body.permissions !== undefined) updates.permissions = body.permissions;
  if (body.quotas !== undefined) updates.quotas = body.quotas;

  await db.update(toolspace).set(updates).where(eq(toolspace.id, id));

  const updated = await db.select().from(toolspace).where(eq(toolspace.id, id));
  return Response.json(updated[0]);
}

// DELETE /api/toolspaces/[id] - Delete a toolspace
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getDb();

  // Check ownership
  const isOwner = await checkOwnership(id, session.user.id);
  if (!isOwner) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  await db.delete(toolspace).where(eq(toolspace.id, id));

  return Response.json({ success: true });
}
