import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { getDb } from "@/server/db";
import { type NewWorkflow, workflow } from "@/server/db/schema";

// GET /api/workflows - List user's workflows
export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getDb();

  const workflows = await db.select().from(workflow).where(eq(workflow.ownerId, session.user.id));

  return Response.json({
    workflows,
    total: workflows.length,
  });
}

// POST /api/workflows - Create a new workflow
export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getDb();
  const body = await req.json();

  const newWorkflow: NewWorkflow = {
    id: crypto.randomUUID(),
    name: body.name || "Untitled Workflow",
    description: body.description || null,
    ownerId: session.user.id,
    dashboardId: body.dashboardId || null,
    nodes: body.nodes ?? [],
    edges: body.edges ?? [],
    variables: body.variables ?? {},
    triggerConfig: body.triggerConfig ?? {},
    isEnabled: body.isEnabled ?? true,
  };

  await db.insert(workflow).values(newWorkflow);

  return Response.json(newWorkflow, { status: 201 });
}
