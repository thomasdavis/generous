import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { getDb } from "@/server/db";
import { dashboard, dashboardCollaborator, type NewDashboard } from "@/server/db/schema";

// Generate a URL-friendly slug from a name
function generateSlug(name: string): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 50);
  const suffix = Math.random().toString(36).slice(2, 8);
  return `${base}-${suffix}`;
}

// GET /api/dashboards - List user's dashboards
export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getDb();

  // Get owned dashboards
  const owned = await db.select().from(dashboard).where(eq(dashboard.ownerId, session.user.id));

  // Get collaborative dashboards
  const collaborations = await db
    .select({
      dashboard: dashboard,
      role: dashboardCollaborator.role,
    })
    .from(dashboardCollaborator)
    .innerJoin(dashboard, eq(dashboardCollaborator.dashboardId, dashboard.id))
    .where(eq(dashboardCollaborator.userId, session.user.id));

  const dashboards = [
    ...owned.map((d) => ({ ...d, role: "owner" as const })),
    ...collaborations.map((c) => ({ ...c.dashboard, role: c.role })),
  ];

  return Response.json({
    dashboards,
    total: dashboards.length,
  });
}

// POST /api/dashboards - Create a new dashboard
export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getDb();
  const body = await req.json();

  const slug = body.slug || generateSlug(body.name || "dashboard");

  // Check slug uniqueness
  const existing = await db.select().from(dashboard).where(eq(dashboard.slug, slug));
  if (existing.length > 0) {
    return Response.json({ error: "Slug already exists" }, { status: 409 });
  }

  const newDashboard: NewDashboard = {
    id: crypto.randomUUID(),
    slug,
    name: body.name || "Untitled Dashboard",
    description: body.description || null,
    ownerId: session.user.id,
    isPublic: body.isPublic ?? false,
    components: body.components ?? [],
    gridLayout: body.gridLayout ?? [{ i: "chat", x: 0, y: 0, w: 4, h: 4 }],
    settings: body.settings ?? {},
  };

  await db.insert(dashboard).values(newDashboard);

  return Response.json(newDashboard, { status: 201 });
}
