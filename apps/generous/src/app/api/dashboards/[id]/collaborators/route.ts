import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { getDb } from "@/server/db";
import { dashboard, dashboardCollaborator, user } from "@/server/db/schema";

// Check if user is owner or admin
async function checkAdminAccess(
  dashboardId: string,
  userId: string,
): Promise<{ hasAccess: boolean; isOwner: boolean }> {
  const db = getDb();

  const owned = await db
    .select()
    .from(dashboard)
    .where(and(eq(dashboard.id, dashboardId), eq(dashboard.ownerId, userId)));

  if (owned.length > 0) {
    return { hasAccess: true, isOwner: true };
  }

  const collab = await db
    .select()
    .from(dashboardCollaborator)
    .where(
      and(
        eq(dashboardCollaborator.dashboardId, dashboardId),
        eq(dashboardCollaborator.userId, userId),
        eq(dashboardCollaborator.role, "admin"),
      ),
    );

  return { hasAccess: collab.length > 0, isOwner: false };
}

// GET /api/dashboards/[id]/collaborators - List collaborators
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getDb();

  // Check access (at least viewer)
  const owned = await db
    .select()
    .from(dashboard)
    .where(and(eq(dashboard.id, id), eq(dashboard.ownerId, session.user.id)));

  const collab = await db
    .select()
    .from(dashboardCollaborator)
    .where(
      and(
        eq(dashboardCollaborator.dashboardId, id),
        eq(dashboardCollaborator.userId, session.user.id),
      ),
    );

  if (owned.length === 0 && collab.length === 0) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  // Get all collaborators with user info
  const collaborators = await db
    .select({
      id: dashboardCollaborator.id,
      userId: dashboardCollaborator.userId,
      role: dashboardCollaborator.role,
      createdAt: dashboardCollaborator.createdAt,
      userName: user.name,
      userEmail: user.email,
      userImage: user.image,
    })
    .from(dashboardCollaborator)
    .innerJoin(user, eq(dashboardCollaborator.userId, user.id))
    .where(eq(dashboardCollaborator.dashboardId, id));

  // Also get owner info
  const dashboards = await db
    .select({
      ownerId: dashboard.ownerId,
      ownerName: user.name,
      ownerEmail: user.email,
      ownerImage: user.image,
    })
    .from(dashboard)
    .innerJoin(user, eq(dashboard.ownerId, user.id))
    .where(eq(dashboard.id, id));

  const owner = dashboards[0];

  return Response.json({
    owner: owner
      ? {
          userId: owner.ownerId,
          name: owner.ownerName,
          email: owner.ownerEmail,
          image: owner.ownerImage,
          role: "owner",
        }
      : null,
    collaborators,
    total: collaborators.length,
  });
}

// POST /api/dashboards/[id]/collaborators - Add a collaborator
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getDb();
  const body = await req.json();

  // Check admin access
  const access = await checkAdminAccess(id, session.user.id);
  if (!access.hasAccess) {
    return Response.json(
      { error: "Only owners and admins can add collaborators" },
      { status: 403 },
    );
  }

  // Find user by email
  const users = await db.select().from(user).where(eq(user.email, body.email));
  if (users.length === 0) {
    return Response.json({ error: "User not found" }, { status: 404 });
  }

  const targetUser = users[0];

  // Check if already a collaborator
  const existing = await db
    .select()
    .from(dashboardCollaborator)
    .where(
      and(
        eq(dashboardCollaborator.dashboardId, id),
        eq(dashboardCollaborator.userId, targetUser.id),
      ),
    );

  if (existing.length > 0) {
    return Response.json({ error: "User is already a collaborator" }, { status: 409 });
  }

  // Check if user is the owner
  const dashboards = await db.select().from(dashboard).where(eq(dashboard.id, id));
  if (dashboards.length > 0 && dashboards[0].ownerId === targetUser.id) {
    return Response.json({ error: "Cannot add owner as collaborator" }, { status: 400 });
  }

  // Add collaborator
  const collaborator = {
    id: crypto.randomUUID(),
    dashboardId: id,
    userId: targetUser.id,
    role: body.role || "viewer",
  };

  await db.insert(dashboardCollaborator).values(collaborator);

  return Response.json(
    {
      ...collaborator,
      userName: targetUser.name,
      userEmail: targetUser.email,
      userImage: targetUser.image,
    },
    { status: 201 },
  );
}

// DELETE /api/dashboards/[id]/collaborators - Remove a collaborator
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getDb();
  const url = new URL(req.url);
  const userId = url.searchParams.get("userId");

  if (!userId) {
    return Response.json({ error: "userId required" }, { status: 400 });
  }

  // Users can remove themselves, or admins can remove others
  const access = await checkAdminAccess(id, session.user.id);
  const isSelf = userId === session.user.id;

  if (!access.hasAccess && !isSelf) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  await db
    .delete(dashboardCollaborator)
    .where(
      and(eq(dashboardCollaborator.dashboardId, id), eq(dashboardCollaborator.userId, userId)),
    );

  return Response.json({ success: true });
}

// PATCH /api/dashboards/[id]/collaborators - Update a collaborator's role
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getDb();
  const body = await req.json();

  if (!body.userId || !body.role) {
    return Response.json({ error: "userId and role required" }, { status: 400 });
  }

  // Check admin access
  const access = await checkAdminAccess(id, session.user.id);
  if (!access.hasAccess) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  // Only owner can promote to admin
  if (body.role === "admin" && !access.isOwner) {
    return Response.json({ error: "Only owner can promote to admin" }, { status: 403 });
  }

  await db
    .update(dashboardCollaborator)
    .set({ role: body.role })
    .where(
      and(eq(dashboardCollaborator.dashboardId, id), eq(dashboardCollaborator.userId, body.userId)),
    );

  return Response.json({ success: true });
}
