import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { getDb } from "@/server/db";
import { dashboard, type NewToolspace, toolspace } from "@/server/db/schema";

// GET /api/toolspaces - List user's toolspaces
export async function GET(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getDb();
  const url = new URL(req.url);
  const dashboardId = url.searchParams.get("dashboardId");

  // Get user's dashboards
  const userDashboards = await db
    .select({ id: dashboard.id })
    .from(dashboard)
    .where(eq(dashboard.ownerId, session.user.id));

  const dashboardIds = userDashboards.map((d) => d.id);

  // Filter by dashboard if specified
  let toolspaces: (typeof toolspace.$inferSelect)[] = [];
  if (dashboardId) {
    if (!dashboardIds.includes(dashboardId)) {
      return Response.json({ error: "Dashboard not found" }, { status: 404 });
    }
    toolspaces = await db.select().from(toolspace).where(eq(toolspace.dashboardId, dashboardId));
  } else {
    // Get all toolspaces for user's dashboards
    toolspaces = [];
    for (const id of dashboardIds) {
      const ts = await db.select().from(toolspace).where(eq(toolspace.dashboardId, id));
      toolspaces.push(...ts);
    }
  }

  return Response.json({
    toolspaces,
    total: toolspaces.length,
  });
}

// POST /api/toolspaces - Create a new toolspace
export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getDb();
  const body = await req.json();

  if (!body.dashboardId) {
    return Response.json({ error: "dashboardId required" }, { status: 400 });
  }

  // Check dashboard ownership
  const dashboards = await db.select().from(dashboard).where(eq(dashboard.id, body.dashboardId));

  if (dashboards.length === 0) {
    return Response.json({ error: "Dashboard not found" }, { status: 404 });
  }

  if (dashboards[0].ownerId !== session.user.id) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const newToolspace: NewToolspace = {
    id: crypto.randomUUID(),
    dashboardId: body.dashboardId,
    name: body.name || "Default Toolspace",
    tools: body.tools ?? [],
    permissions: body.permissions ?? {},
    quotas: body.quotas ?? {},
  };

  await db.insert(toolspace).values(newToolspace);

  return Response.json(newToolspace, { status: 201 });
}
