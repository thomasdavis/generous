import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { getDb } from "@/server/db";
import {
  dashboard,
  type NewDashboard,
  type NewTemplateUsage,
  template,
  templateUsage,
} from "@/server/db/schema";

// Generate a URL-friendly slug
function generateSlug(name: string): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 50);
  const suffix = Math.random().toString(36).slice(2, 8);
  return `${base}-${suffix}`;
}

// POST /api/templates/[id]/install - Create dashboard from template
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getDb();
  const body = await req.json().catch(() => ({}));

  // Find template
  const templates = await db.select().from(template).where(eq(template.id, id));

  if (templates.length === 0) {
    return Response.json({ error: "Template not found" }, { status: 404 });
  }

  const t = templates[0];

  // Check if published or user is author
  if (!t.isPublished && t.authorId !== session.user.id) {
    return Response.json({ error: "Template not found" }, { status: 404 });
  }

  const content = t.content as {
    name?: string;
    description?: string;
    components?: unknown[];
    gridLayout?: unknown[];
    settings?: Record<string, unknown>;
  };

  // Create dashboard from template
  const dashboardName = body.name || content.name || `${t.name} Dashboard`;
  const newDashboard: NewDashboard = {
    id: crypto.randomUUID(),
    slug: generateSlug(dashboardName),
    name: dashboardName,
    description: body.description || content.description || t.description,
    ownerId: session.user.id,
    isPublic: false,
    components: content.components ?? [],
    gridLayout: content.gridLayout ?? [{ i: "chat", x: 0, y: 0, w: 4, h: 4 }],
    settings: content.settings ?? {},
  };

  await db.insert(dashboard).values(newDashboard);

  // Record template usage
  const usage: NewTemplateUsage = {
    id: crypto.randomUUID(),
    templateId: id,
    userId: session.user.id,
    instantiatedId: newDashboard.id,
  };

  await db.insert(templateUsage).values(usage);

  // Increment download count
  await db
    .update(template)
    .set({ downloads: t.downloads + 1 })
    .where(eq(template.id, id));

  return Response.json(
    {
      dashboard: newDashboard,
      message: `Dashboard "${dashboardName}" created from template`,
    },
    { status: 201 },
  );
}
