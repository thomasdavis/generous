import { eq } from "drizzle-orm";
import { getDb } from "@/server/db";
import { inventory, type NewInventory } from "@/server/db/schema";

// GET /api/inventory - List all inventory items
export async function GET(req: Request) {
  const db = getDb();
  const url = new URL(req.url);
  const itemType = url.searchParams.get("type");
  const species = url.searchParams.get("species");
  const lowStock = url.searchParams.get("lowStock") === "true";

  let query = db.select().from(inventory);

  if (itemType) {
    query = query.where(eq(inventory.itemType, itemType)) as typeof query;
  }
  if (species) {
    query = query.where(eq(inventory.species, species)) as typeof query;
  }

  const items = await query;

  // Filter low stock items if requested
  const filteredItems = lowStock
    ? items.filter((item) => item.quantity <= (item.reorderLevel || 10))
    : items;

  // Calculate stats
  const totalValue = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const lowStockCount = items.filter((item) => item.quantity <= (item.reorderLevel || 10)).length;

  return Response.json({
    items: filteredItems,
    total: filteredItems.length,
    totalValue,
    lowStockCount,
    itemTypes: [...new Set(items.map((i) => i.itemType))],
  });
}

// POST /api/inventory - Create a new inventory item
export async function POST(req: Request) {
  const db = getDb();
  const body = await req.json();

  if (!body.itemName || !body.itemType || body.unitPrice === undefined) {
    return Response.json(
      { error: "itemName, itemType, and unitPrice are required" },
      { status: 400 },
    );
  }

  const newItem: NewInventory = {
    id: crypto.randomUUID(),
    itemName: body.itemName,
    itemType: body.itemType,
    species: body.species || null,
    quantity: body.quantity || 0,
    unitPrice: body.unitPrice,
    reorderLevel: body.reorderLevel || 10,
    supplier: body.supplier || null,
  };

  await db.insert(inventory).values(newItem);

  return Response.json(newItem, { status: 201 });
}
