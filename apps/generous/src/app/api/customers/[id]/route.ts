import { eq } from "drizzle-orm";
import { getDb } from "@/server/db";
import { customer, order } from "@/server/db/schema";

// GET /api/customers/:id - Get a single customer
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = getDb();

  const result = await db.select().from(customer).where(eq(customer.id, id));

  if (result.length === 0) {
    return Response.json({ error: "Customer not found" }, { status: 404 });
  }

  return Response.json(result[0]);
}

// PUT /api/customers/:id - Update a customer
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = getDb();
  const body = await req.json();

  const updateData: Record<string, unknown> = {
    updatedAt: new Date(),
  };

  if (body.firstName !== undefined) updateData.firstName = body.firstName;
  if (body.lastName !== undefined) updateData.lastName = body.lastName;
  if (body.email !== undefined) updateData.email = body.email;
  if (body.phone !== undefined) updateData.phone = body.phone;
  if (body.address !== undefined) updateData.address = body.address;
  if (body.city !== undefined) updateData.city = body.city;
  if (body.state !== undefined) updateData.state = body.state;
  if (body.zipCode !== undefined) updateData.zipCode = body.zipCode;

  await db.update(customer).set(updateData).where(eq(customer.id, id));

  const result = await db.select().from(customer).where(eq(customer.id, id));

  if (result.length === 0) {
    return Response.json({ error: "Customer not found" }, { status: 404 });
  }

  return Response.json(result[0]);
}

// DELETE /api/customers/:id - Delete a customer
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = getDb();

  const existing = await db.select().from(customer).where(eq(customer.id, id));
  if (existing.length === 0) {
    return Response.json({ error: "Customer not found" }, { status: 404 });
  }

  // Check if customer has orders
  const customerOrders = await db.select().from(order).where(eq(order.customerId, id));
  if (customerOrders.length > 0) {
    return Response.json({ error: "Cannot delete customer with existing orders" }, { status: 400 });
  }

  await db.delete(customer).where(eq(customer.id, id));

  return new Response(null, { status: 204 });
}
