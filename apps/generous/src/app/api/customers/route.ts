import { like } from "drizzle-orm";
import { getDb } from "@/server/db";
import { customer, type NewCustomer } from "@/server/db/schema";

// GET /api/customers - List all customers
export async function GET(req: Request) {
  const db = getDb();
  const url = new URL(req.url);
  const search = url.searchParams.get("search");
  const limit = parseInt(url.searchParams.get("limit") || "50", 10);
  const offset = parseInt(url.searchParams.get("offset") || "0", 10);

  let query = db.select().from(customer);

  if (search) {
    query = query.where(like(customer.email, `%${search}%`)) as typeof query;
  }

  const customers = await query.limit(limit).offset(offset);
  const total = await db.select().from(customer);

  return Response.json({
    customers,
    total: total.length,
    limit,
    offset,
  });
}

// POST /api/customers - Create a new customer
export async function POST(req: Request) {
  const db = getDb();
  const body = await req.json();

  if (!body.firstName || !body.lastName || !body.email) {
    return Response.json({ error: "firstName, lastName, and email are required" }, { status: 400 });
  }

  const newCustomer: NewCustomer = {
    id: crypto.randomUUID(),
    userId: body.userId || null,
    firstName: body.firstName,
    lastName: body.lastName,
    email: body.email,
    phone: body.phone || null,
    address: body.address || null,
    city: body.city || null,
    state: body.state || null,
    zipCode: body.zipCode || null,
  };

  await db.insert(customer).values(newCustomer);

  return Response.json(newCustomer, { status: 201 });
}
