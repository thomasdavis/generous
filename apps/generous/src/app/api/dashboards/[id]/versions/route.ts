import { and, desc, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { getDb } from "@/server/db";
import { dashboard, dashboardCollaborator, dashboardVersion } from "@/server/db/schema";

// Check if user has access to dashboard
async function checkAccess(
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
      ),
    );

  return { hasAccess: collab.length > 0, isOwner: false };
}

// GET /api/dashboards/[id]/versions - List version history
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getDb();

  // Check access
  const access = await checkAccess(id, session.user.id);
  if (!access.hasAccess) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const versions = await db
    .select()
    .from(dashboardVersion)
    .where(eq(dashboardVersion.dashboardId, id))
    .orderBy(desc(dashboardVersion.version));

  return Response.json({ versions, total: versions.length });
}

// POST /api/dashboards/[id]/versions - Create a snapshot
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getDb();
  const body = await req.json();

  // Check editor access
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

  const hasEditAccess =
    owned.length > 0 || collab.some((c) => c.role === "editor" || c.role === "admin");

  if (!hasEditAccess) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  // Get current dashboard
  const dashboards = await db.select().from(dashboard).where(eq(dashboard.id, id));
  if (dashboards.length === 0) {
    return Response.json({ error: "Dashboard not found" }, { status: 404 });
  }

  const current = dashboards[0];

  // Get latest version number
  const versions = await db
    .select()
    .from(dashboardVersion)
    .where(eq(dashboardVersion.dashboardId, id))
    .orderBy(desc(dashboardVersion.version))
    .limit(1);

  const nextVersion = versions.length > 0 ? versions[0].version + 1 : 1;

  // Create version
  const version = {
    id: crypto.randomUUID(),
    dashboardId: id,
    version: nextVersion,
    components: current.components as unknown[],
    gridLayout: current.gridLayout as unknown[],
    createdBy: session.user.id,
    comment: body.comment || null,
  };

  await db.insert(dashboardVersion).values(version);

  return Response.json(version, { status: 201 });
}
