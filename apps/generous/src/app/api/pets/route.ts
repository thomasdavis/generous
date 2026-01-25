import { eq } from "drizzle-orm";
import { getDb } from "@/server/db";
import { type NewPet, pet } from "@/server/db/schema";

// GET /api/pets - List all pets
export async function GET(req: Request) {
  const db = getDb();
  const url = new URL(req.url);
  const status = url.searchParams.get("status");
  const species = url.searchParams.get("species");

  const query = db.select().from(pet);

  // Build query with filters
  const conditions = [];
  if (status) {
    conditions.push(eq(pet.status, status));
  }
  if (species) {
    conditions.push(eq(pet.species, species));
  }

  const pets =
    conditions.length > 0
      ? await query.where(conditions.length === 1 ? conditions[0] : undefined)
      : await query;

  return Response.json({
    pets,
    total: pets.length,
  });
}

// POST /api/pets - Create a new pet
export async function POST(req: Request) {
  const db = getDb();
  const body = await req.json();

  const newPet: NewPet = {
    id: crypto.randomUUID(),
    name: body.name,
    species: body.species,
    breed: body.breed || null,
    age: body.age || null,
    price: body.price,
    status: body.status || "available",
    description: body.description || null,
    imageUrl: body.imageUrl || null,
  };

  await db.insert(pet).values(newPet);

  return Response.json(newPet, { status: 201 });
}
