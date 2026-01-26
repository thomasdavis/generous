import { eq } from "drizzle-orm";
import { getDb } from "@/server/db";
import { inventory } from "@/server/db/schema";

// GET /api/inventory/:id - Get a single inventory item
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = getDb();

  const result = await db.select().from(inventory).where(eq(inventory.id, id));

  if (result.length === 0) {
    return Response.json({ error: "Inventory item not found" }, { status: 404 });
  }

  return Response.json(result[0]);
}

// PUT /api/inventory/:id - Update an inventory item
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = getDb();
  const body = await req.json();

  const updateData: Record<string, unknown> = {
    updatedAt: new Date(),
  };

  if (body.itemName !== undefined) updateData.itemName = body.itemName;
  if (body.itemType !== undefined) updateData.itemType = body.itemType;
  if (body.species !== undefined) updateData.species = body.species;
  if (body.quantity !== undefined) updateData.quantity = body.quantity;
  if (body.unitPrice !== undefined) updateData.unitPrice = body.unitPrice;
  if (body.reorderLevel !== undefined) updateData.reorderLevel = body.reorderLevel;
  if (body.supplier !== undefined) updateData.supplier = body.supplier;

  await db.update(inventory).set(updateData).where(eq(inventory.id, id));

  const result = await db.select().from(inventory).where(eq(inventory.id, id));

  if (result.length === 0) {
    return Response.json({ error: "Inventory item not found" }, { status: 404 });
  }

  return Response.json(result[0]);
}

// PATCH /api/inventory/:id - Adjust inventory quantity
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = getDb();
  const body = await req.json();

  const existing = await db.select().from(inventory).where(eq(inventory.id, id));
  if (existing.length === 0) {
    return Response.json({ error: "Inventory item not found" }, { status: 404 });
  }

  const item = existing[0];
  if (!item) {
    return Response.json({ error: "Inventory item not found" }, { status: 404 });
  }

  // Support adjusting quantity by a delta
  if (body.adjustQuantity !== undefined) {
    const newQuantity = item.quantity + body.adjustQuantity;
    if (newQuantity < 0) {
      return Response.json({ error: "Quantity cannot be negative" }, { status: 400 });
    }
    await db
      .update(inventory)
      .set({ quantity: newQuantity, updatedAt: new Date() })
      .where(eq(inventory.id, id));
  }

  const result = await db.select().from(inventory).where(eq(inventory.id, id));

  return Response.json(result[0]);
}

// DELETE /api/inventory/:id - Delete an inventory item
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = getDb();

  const existing = await db.select().from(inventory).where(eq(inventory.id, id));
  if (existing.length === 0) {
    return Response.json({ error: "Inventory item not found" }, { status: 404 });
  }

  await db.delete(inventory).where(eq(inventory.id, id));

  return new Response(null, { status: 204 });
}
