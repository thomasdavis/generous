import { eq } from "drizzle-orm";
import { getDb } from "@/server/db";
import { category } from "@/server/db/schema";

// GET /api/categories/:id - Get a single category
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = getDb();

  const result = await db.select().from(category).where(eq(category.id, id));

  if (result.length === 0) {
    return Response.json({ error: "Category not found" }, { status: 404 });
  }

  return Response.json(result[0]);
}

// PUT /api/categories/:id - Update a category
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = getDb();
  const body = await req.json();

  const updateData: Record<string, unknown> = {};

  if (body.name !== undefined) updateData.name = body.name;
  if (body.description !== undefined) updateData.description = body.description;

  if (Object.keys(updateData).length === 0) {
    return Response.json({ error: "No fields to update" }, { status: 400 });
  }

  await db.update(category).set(updateData).where(eq(category.id, id));

  const result = await db.select().from(category).where(eq(category.id, id));

  if (result.length === 0) {
    return Response.json({ error: "Category not found" }, { status: 404 });
  }

  return Response.json(result[0]);
}

// DELETE /api/categories/:id - Delete a category
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = getDb();

  const existing = await db.select().from(category).where(eq(category.id, id));
  if (existing.length === 0) {
    return Response.json({ error: "Category not found" }, { status: 404 });
  }

  await db.delete(category).where(eq(category.id, id));

  return new Response(null, { status: 204 });
}
