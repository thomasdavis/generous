import { getDb } from "@/server/db";
import { category, type NewCategory } from "@/server/db/schema";

// GET /api/categories - List all categories
export async function GET() {
  const db = getDb();
  const categories = await db.select().from(category);

  return Response.json({
    categories,
    total: categories.length,
  });
}

// POST /api/categories - Create a new category
export async function POST(req: Request) {
  const db = getDb();
  const body = await req.json();

  if (!body.name) {
    return Response.json({ error: "Name is required" }, { status: 400 });
  }

  const newCategory: NewCategory = {
    id: crypto.randomUUID(),
    name: body.name,
    description: body.description || null,
  };

  await db.insert(category).values(newCategory);

  return Response.json(newCategory, { status: 201 });
}
