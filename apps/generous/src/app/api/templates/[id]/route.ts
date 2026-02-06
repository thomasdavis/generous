import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { getDb } from "@/server/db";
import { template, user } from "@/server/db/schema";

// GET /api/templates/[id] - Get template details
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = getDb();

  const templates = await db
    .select({
      template: template,
      authorName: user.name,
      authorImage: user.image,
    })
    .from(template)
    .innerJoin(user, eq(template.authorId, user.id))
    .where(eq(template.id, id));

  if (templates.length === 0) {
    return Response.json({ error: "Template not found" }, { status: 404 });
  }

  const t = templates[0];

  // Check if template is published or user is the author
  const session = await auth.api.getSession({ headers: await headers() });
  if (!t.template.isPublished) {
    if (!session?.user?.id || session.user.id !== t.template.authorId) {
      return Response.json({ error: "Template not found" }, { status: 404 });
    }
  }

  return Response.json({
    ...t.template,
    authorName: t.authorName,
    authorImage: t.authorImage,
  });
}

// PATCH /api/templates/[id] - Update template (author only)
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getDb();
  const body = await req.json();

  // Find template
  const templates = await db.select().from(template).where(eq(template.id, id));
  if (templates.length === 0) {
    return Response.json({ error: "Template not found" }, { status: 404 });
  }

  const t = templates[0];

  // Check ownership
  if (t.authorId !== session.user.id) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  // Update fields
  const updates: Partial<typeof t> = {
    updatedAt: new Date(),
  };

  if (body.name !== undefined) updates.name = body.name;
  if (body.description !== undefined) updates.description = body.description;
  if (body.category !== undefined) updates.category = body.category;
  if (body.content !== undefined) updates.content = body.content;
  if (body.thumbnail !== undefined) updates.thumbnail = body.thumbnail;
  if (body.isPublished !== undefined) updates.isPublished = body.isPublished;
  if (body.tags !== undefined) updates.tags = body.tags;

  await db.update(template).set(updates).where(eq(template.id, id));

  const updated = await db.select().from(template).where(eq(template.id, id));
  return Response.json(updated[0]);
}

// DELETE /api/templates/[id] - Delete template (author only)
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getDb();

  // Find template
  const templates = await db.select().from(template).where(eq(template.id, id));
  if (templates.length === 0) {
    return Response.json({ error: "Template not found" }, { status: 404 });
  }

  const t = templates[0];

  // Check ownership
  if (t.authorId !== session.user.id) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  await db.delete(template).where(eq(template.id, id));

  return Response.json({ success: true });
}
