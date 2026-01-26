import { eq } from "drizzle-orm";
import { getDb } from "@/server/db";
import { customer, order, pet } from "@/server/db/schema";

// GET /api/orders/:id - Get a single order with customer and pet details
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = getDb();

  const result = await db.select().from(order).where(eq(order.id, id));

  if (result.length === 0) {
    return Response.json({ error: "Order not found" }, { status: 404 });
  }

  const theOrder = result[0];
  if (!theOrder) {
    return Response.json({ error: "Order not found" }, { status: 404 });
  }

  // Get customer and pet details
  const customerResult = await db
    .select()
    .from(customer)
    .where(eq(customer.id, theOrder.customerId));
  const petResult = await db.select().from(pet).where(eq(pet.id, theOrder.petId));

  return Response.json({
    ...theOrder,
    customer: customerResult[0] || null,
    pet: petResult[0] || null,
  });
}

// PATCH /api/orders/:id - Update order status
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = getDb();
  const body = await req.json();

  const existing = await db.select().from(order).where(eq(order.id, id));
  if (existing.length === 0) {
    return Response.json({ error: "Order not found" }, { status: 404 });
  }

  const currentOrder = existing[0];
  if (!currentOrder) {
    return Response.json({ error: "Order not found" }, { status: 404 });
  }

  const updateData: Record<string, unknown> = {
    updatedAt: new Date(),
  };

  if (body.status !== undefined) {
    const validStatuses = ["placed", "approved", "delivered", "cancelled"];
    if (!validStatuses.includes(body.status)) {
      return Response.json(
        { error: `Invalid status. Must be one of: ${validStatuses.join(", ")}` },
        { status: 400 },
      );
    }
    updateData.status = body.status;

    // Update pet status based on order status
    if (body.status === "delivered") {
      await db
        .update(pet)
        .set({ status: "adopted", updatedAt: new Date() })
        .where(eq(pet.id, currentOrder.petId));
    } else if (body.status === "cancelled") {
      await db
        .update(pet)
        .set({ status: "available", updatedAt: new Date() })
        .where(eq(pet.id, currentOrder.petId));
    }
  }

  if (body.shipDate !== undefined)
    updateData.shipDate = body.shipDate ? new Date(body.shipDate) : null;
  if (body.notes !== undefined) updateData.notes = body.notes;

  await db.update(order).set(updateData).where(eq(order.id, id));

  const result = await db.select().from(order).where(eq(order.id, id));

  return Response.json(result[0]);
}

// DELETE /api/orders/:id - Delete (cancel) an order
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = getDb();

  const existing = await db.select().from(order).where(eq(order.id, id));
  if (existing.length === 0) {
    return Response.json({ error: "Order not found" }, { status: 404 });
  }

  const theOrder = existing[0];
  if (!theOrder) {
    return Response.json({ error: "Order not found" }, { status: 404 });
  }

  // Only allow deleting placed or cancelled orders
  if (theOrder.status === "delivered") {
    return Response.json({ error: "Cannot delete a delivered order" }, { status: 400 });
  }

  // Restore pet to available if it was pending
  if (theOrder.status === "placed" || theOrder.status === "approved") {
    await db
      .update(pet)
      .set({ status: "available", updatedAt: new Date() })
      .where(eq(pet.id, theOrder.petId));
  }

  await db.delete(order).where(eq(order.id, id));

  return new Response(null, { status: 204 });
}
