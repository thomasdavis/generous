import { eq } from "drizzle-orm";
import { getDb } from "@/server/db";
import { customer, inventory, order, pet, storeInfo } from "@/server/db/schema";

// GET /api/store - Get store info and stats
export async function GET() {
  const db = getDb();

  // Get or create store info
  let store = await db.select().from(storeInfo).where(eq(storeInfo.id, "store"));

  if (store.length === 0) {
    // Create default store info
    await db.insert(storeInfo).values({
      id: "store",
      name: "Pet Paradise",
      address: "123 Pet Street, Animal City, AC 12345",
      phone: "(555) 123-4567",
      email: "info@petparadise.example",
      openingHours: JSON.stringify({
        monday: "9:00 AM - 6:00 PM",
        tuesday: "9:00 AM - 6:00 PM",
        wednesday: "9:00 AM - 6:00 PM",
        thursday: "9:00 AM - 6:00 PM",
        friday: "9:00 AM - 8:00 PM",
        saturday: "10:00 AM - 5:00 PM",
        sunday: "Closed",
      }),
      isOpen: true,
    });
    store = await db.select().from(storeInfo).where(eq(storeInfo.id, "store"));
  }

  // Get stats
  const pets = await db.select().from(pet);
  const orders = await db.select().from(order);
  const customers = await db.select().from(customer);
  const inventoryItems = await db.select().from(inventory);

  const availablePets = pets.filter((p) => p.status === "available").length;
  const pendingOrders = orders.filter(
    (o) => o.status === "placed" || o.status === "approved",
  ).length;
  const totalRevenue = orders
    .filter((o) => o.status === "delivered")
    .reduce((sum, o) => sum + o.totalPrice, 0);
  const lowStockItems = inventoryItems.filter((i) => i.quantity <= (i.reorderLevel || 10)).length;

  const storeData = store[0];
  if (!storeData) {
    return Response.json({ error: "Store info not found" }, { status: 404 });
  }

  return Response.json({
    ...storeData,
    openingHours: storeData.openingHours ? JSON.parse(storeData.openingHours) : null,
    stats: {
      totalPets: pets.length,
      availablePets,
      adoptedPets: pets.filter((p) => p.status === "adopted").length,
      totalOrders: orders.length,
      pendingOrders,
      deliveredOrders: orders.filter((o) => o.status === "delivered").length,
      totalCustomers: customers.length,
      totalRevenue,
      inventoryItems: inventoryItems.length,
      lowStockItems,
    },
  });
}

// PUT /api/store - Update store info
export async function PUT(req: Request) {
  const db = getDb();
  const body = await req.json();

  const updateData: Record<string, unknown> = {
    updatedAt: new Date(),
  };

  if (body.name !== undefined) updateData.name = body.name;
  if (body.address !== undefined) updateData.address = body.address;
  if (body.phone !== undefined) updateData.phone = body.phone;
  if (body.email !== undefined) updateData.email = body.email;
  if (body.openingHours !== undefined) {
    updateData.openingHours =
      typeof body.openingHours === "string" ? body.openingHours : JSON.stringify(body.openingHours);
  }
  if (body.isOpen !== undefined) updateData.isOpen = body.isOpen;

  await db.update(storeInfo).set(updateData).where(eq(storeInfo.id, "store"));

  const result = await db.select().from(storeInfo).where(eq(storeInfo.id, "store"));

  const storeData = result[0];
  if (!storeData) {
    return Response.json({ error: "Store info not found" }, { status: 404 });
  }

  return Response.json({
    ...storeData,
    openingHours: storeData.openingHours ? JSON.parse(storeData.openingHours) : null,
  });
}
