import { getDb } from "@/server/db";
import { pet } from "@/server/db/schema";

// GET /api/pets/stats - Get pet statistics
export async function GET() {
  const db = getDb();
  const pets = await db.select().from(pet);

  // Count by status
  const statusCounts = pets.reduce(
    (acc, p) => {
      acc[p.status] = (acc[p.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  // Count by species
  const speciesCounts = pets.reduce(
    (acc, p) => {
      acc[p.species] = (acc[p.species] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  // Price stats
  const prices = pets.map((p) => p.price);
  const avgPrice = prices.length > 0 ? prices.reduce((a, b) => a + b, 0) / prices.length : 0;
  const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
  const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;

  // Age stats (only for pets with age)
  const ages = pets.filter((p) => p.age !== null).map((p) => p.age as number);
  const avgAge = ages.length > 0 ? ages.reduce((a, b) => a + b, 0) / ages.length : 0;

  // Recent additions (last 7 days)
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const recentCount = pets.filter((p) => new Date(p.createdAt) >= oneWeekAgo).length;

  return Response.json({
    total: pets.length,
    byStatus: statusCounts,
    bySpecies: speciesCounts,
    pricing: {
      average: Math.round(avgPrice),
      min: minPrice,
      max: maxPrice,
    },
    age: {
      average: Math.round(avgAge * 10) / 10,
      petsWithAge: ages.length,
    },
    recentAdditions: recentCount,
  });
}
