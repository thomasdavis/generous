import { and, eq, gte, like, lte, or } from "drizzle-orm";
import { getDb } from "@/server/db";
import { pet } from "@/server/db/schema";

// GET /api/pets/search - Advanced pet search
export async function GET(req: Request) {
  const db = getDb();
  const url = new URL(req.url);

  // Search parameters
  const query = url.searchParams.get("q");
  const species = url.searchParams.get("species");
  const status = url.searchParams.get("status");
  const minPrice = url.searchParams.get("minPrice");
  const maxPrice = url.searchParams.get("maxPrice");
  const minAge = url.searchParams.get("minAge");
  const maxAge = url.searchParams.get("maxAge");
  const breed = url.searchParams.get("breed");
  const limit = parseInt(url.searchParams.get("limit") || "20", 10);
  const offset = parseInt(url.searchParams.get("offset") || "0", 10);

  // Build conditions
  const conditions = [];

  if (query) {
    conditions.push(
      or(
        like(pet.name, `%${query}%`),
        like(pet.breed, `%${query}%`),
        like(pet.description, `%${query}%`),
      ),
    );
  }

  if (species) {
    conditions.push(eq(pet.species, species));
  }

  if (status) {
    conditions.push(eq(pet.status, status));
  }

  if (minPrice) {
    conditions.push(gte(pet.price, parseInt(minPrice, 10)));
  }

  if (maxPrice) {
    conditions.push(lte(pet.price, parseInt(maxPrice, 10)));
  }

  if (minAge) {
    conditions.push(gte(pet.age, parseInt(minAge, 10)));
  }

  if (maxAge) {
    conditions.push(lte(pet.age, parseInt(maxAge, 10)));
  }

  if (breed) {
    conditions.push(like(pet.breed, `%${breed}%`));
  }

  // Execute query
  let dbQuery = db.select().from(pet);

  if (conditions.length > 0) {
    const validConditions = conditions.filter((c) => c !== undefined);
    if (validConditions.length === 1) {
      dbQuery = dbQuery.where(validConditions[0]) as typeof dbQuery;
    } else if (validConditions.length > 1) {
      dbQuery = dbQuery.where(and(...validConditions)) as typeof dbQuery;
    }
  }

  const allResults = await dbQuery;
  const paginatedResults = allResults.slice(offset, offset + limit);

  return Response.json({
    pets: paginatedResults,
    total: allResults.length,
    limit,
    offset,
    hasMore: offset + limit < allResults.length,
  });
}
