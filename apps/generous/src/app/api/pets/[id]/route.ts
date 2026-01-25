import { eq } from "drizzle-orm";
import { getDb } from "@/server/db";
import { pet } from "@/server/db/schema";

// GET /api/pets/:id - Get a single pet
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = getDb();

  const result = await db.select().from(pet).where(eq(pet.id, id));

  if (result.length === 0) {
    return Response.json({ error: "Pet not found" }, { status: 404 });
  }

  return Response.json(result[0]);
}

// PATCH /api/pets/:id - Update a pet
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = getDb();
  const body = await req.json();

  const updateData: Record<string, unknown> = {
    updatedAt: new Date(),
  };

  if (body.name !== undefined) updateData.name = body.name;
  if (body.species !== undefined) updateData.species = body.species;
  if (body.breed !== undefined) updateData.breed = body.breed;
  if (body.age !== undefined) updateData.age = body.age;
  if (body.price !== undefined) updateData.price = body.price;
  if (body.status !== undefined) updateData.status = body.status;
  if (body.description !== undefined) updateData.description = body.description;
  if (body.imageUrl !== undefined) updateData.imageUrl = body.imageUrl;

  await db.update(pet).set(updateData).where(eq(pet.id, id));

  const result = await db.select().from(pet).where(eq(pet.id, id));

  if (result.length === 0) {
    return Response.json({ error: "Pet not found" }, { status: 404 });
  }

  return Response.json(result[0]);
}

// DELETE /api/pets/:id - Delete a pet
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = getDb();

  await db.delete(pet).where(eq(pet.id, id));

  return new Response(null, { status: 204 });
}
