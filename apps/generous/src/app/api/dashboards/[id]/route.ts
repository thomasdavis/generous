import { and, eq, or } from "drizzle-orm";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { getDb } from "@/server/db";
import { dashboard, dashboardCollaborator, dashboardVersion } from "@/server/db/schema";

// Check if user has access to dashboard
async function checkAccess(
  dashboardId: string,
  userId: string,
  requiredRole: "viewer" | "editor" | "admin" | "owner" = "viewer",
): Promise<{ hasAccess: boolean; isOwner: boolean; role: string }> {
  const db = getDb();

  // Check ownership
  const owned = await db
    .select()
    .from(dashboard)
    .where(and(eq(dashboard.id, dashboardId), eq(dashboard.ownerId, userId)));

  if (owned.length > 0) {
    return { hasAccess: true, isOwner: true, role: "owner" };
  }

  // Check collaboration
  const collab = await db
    .select()
    .from(dashboardCollaborator)
    .where(
      and(
        eq(dashboardCollaborator.dashboardId, dashboardId),
        eq(dashboardCollaborator.userId, userId),
      ),
    );

  if (collab.length === 0) {
    return { hasAccess: false, isOwner: false, role: "none" };
  }

  const role = collab[0].role;
  const roleHierarchy = { viewer: 0, editor: 1, admin: 2, owner: 3 };
  const hasAccess =
    roleHierarchy[role as keyof typeof roleHierarchy] >= roleHierarchy[requiredRole];

  return { hasAccess, isOwner: false, role };
}

// GET /api/dashboards/[id] - Get a dashboard
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = getDb();

  // Try to find by ID or slug
  const dashboards = await db
    .select()
    .from(dashboard)
    .where(or(eq(dashboard.id, id), eq(dashboard.slug, id)));

  if (dashboards.length === 0) {
    return Response.json({ error: "Dashboard not found" }, { status: 404 });
  }

  const found = dashboards[0];

  // Public dashboards are accessible to anyone
  if (found.isPublic) {
    return Response.json(found);
  }

  // Private dashboards require authentication
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const access = await checkAccess(found.id, session.user.id);
  if (!access.hasAccess) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  return Response.json({ ...found, role: access.role });
}

// PATCH /api/dashboards/[id] - Update a dashboard
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getDb();
  const body = await req.json();

  // Find dashboard
  const dashboards = await db.select().from(dashboard).where(eq(dashboard.id, id));
  if (dashboards.length === 0) {
    return Response.json({ error: "Dashboard not found" }, { status: 404 });
  }

  const found = dashboards[0];

  // Check edit access
  const access = await checkAccess(id, session.user.id, "editor");
  if (!access.hasAccess) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  // Only owners can change slug, visibility, or transfer ownership
  if (!access.isOwner && (body.slug || body.isPublic !== undefined || body.ownerId)) {
    return Response.json({ error: "Only owners can modify these fields" }, { status: 403 });
  }

  // Check slug uniqueness if changing
  if (body.slug && body.slug !== found.slug) {
    const existing = await db.select().from(dashboard).where(eq(dashboard.slug, body.slug));
    if (existing.length > 0) {
      return Response.json({ error: "Slug already exists" }, { status: 409 });
    }
  }

  // Create version snapshot if components or layout changed
  if (body.components || body.gridLayout) {
    const versionCount = await db
      .select()
      .from(dashboardVersion)
      .where(eq(dashboardVersion.dashboardId, id));

    await db.insert(dashboardVersion).values({
      id: crypto.randomUUID(),
      dashboardId: id,
      version: versionCount.length + 1,
      components: found.components as unknown[],
      gridLayout: found.gridLayout as unknown[],
      createdBy: session.user.id,
      comment: body.versionComment,
    });
  }

  // Update dashboard
  const updates: Partial<typeof found> = {
    updatedAt: new Date(),
  };

  if (body.name !== undefined) updates.name = body.name;
  if (body.description !== undefined) updates.description = body.description;
  if (body.slug !== undefined) updates.slug = body.slug;
  if (body.isPublic !== undefined) updates.isPublic = body.isPublic;
  if (body.components !== undefined) updates.components = body.components;
  if (body.gridLayout !== undefined) updates.gridLayout = body.gridLayout;
  if (body.settings !== undefined) updates.settings = body.settings;

  await db.update(dashboard).set(updates).where(eq(dashboard.id, id));

  const updated = await db.select().from(dashboard).where(eq(dashboard.id, id));
  return Response.json(updated[0]);
}

// DELETE /api/dashboards/[id] - Delete a dashboard
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getDb();

  // Only owner can delete
  const access = await checkAccess(id, session.user.id, "owner");
  if (!access.isOwner) {
    return Response.json({ error: "Only owners can delete dashboards" }, { status: 403 });
  }

  // Delete dashboard (cascades to versions and collaborators)
  await db.delete(dashboard).where(eq(dashboard.id, id));

  return Response.json({ success: true });
}
