import { desc, eq } from "drizzle-orm";
import { getDb } from "@/server/db";
import { customer, type NewOrder, order, pet } from "@/server/db/schema";

// GET /api/orders - List all orders
export async function GET(req: Request) {
  const db = getDb();
  const url = new URL(req.url);
  const status = url.searchParams.get("status");
  const customerId = url.searchParams.get("customerId");
  const limit = parseInt(url.searchParams.get("limit") || "50", 10);
  const offset = parseInt(url.searchParams.get("offset") || "0", 10);

  let query = db.select().from(order).orderBy(desc(order.createdAt));

  if (status) {
    query = query.where(eq(order.status, status)) as typeof query;
  }
  if (customerId) {
    query = query.where(eq(order.customerId, customerId)) as typeof query;
  }

  const orders = await query.limit(limit).offset(offset);

  // Get totals by status
  const allOrders = await db.select().from(order);
  const statusCounts = allOrders.reduce(
    (acc, o) => {
      acc[o.status] = (acc[o.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  return Response.json({
    orders,
    total: allOrders.length,
    statusCounts,
    limit,
    offset,
  });
}

// POST /api/orders - Create a new order
export async function POST(req: Request) {
  const db = getDb();
  const body = await req.json();

  if (!body.customerId || !body.petId) {
    return Response.json({ error: "customerId and petId are required" }, { status: 400 });
  }

  // Verify customer exists
  const customerResult = await db.select().from(customer).where(eq(customer.id, body.customerId));
  if (customerResult.length === 0) {
    return Response.json({ error: "Customer not found" }, { status: 404 });
  }

  // Verify pet exists and is available
  const petResult = await db.select().from(pet).where(eq(pet.id, body.petId));
  if (petResult.length === 0) {
    return Response.json({ error: "Pet not found" }, { status: 404 });
  }

  const thePet = petResult[0];
  if (!thePet) {
    return Response.json({ error: "Pet not found" }, { status: 404 });
  }
  if (thePet.status !== "available") {
    return Response.json({ error: "Pet is not available for purchase" }, { status: 400 });
  }

  const newOrder: NewOrder = {
    id: crypto.randomUUID(),
    customerId: body.customerId,
    petId: body.petId,
    status: "placed",
    quantity: body.quantity || 1,
    totalPrice: thePet.price * (body.quantity || 1),
    shipDate: body.shipDate ? new Date(body.shipDate) : null,
    notes: body.notes || null,
  };

  await db.insert(order).values(newOrder);

  // Update pet status to pending
  await db
    .update(pet)
    .set({ status: "pending", updatedAt: new Date() })
    .where(eq(pet.id, body.petId));

  return Response.json(newOrder, { status: 201 });
}
