import { getDb } from "@/server/db";
import { type NewPet, pet } from "@/server/db/schema";

const samplePets: Omit<NewPet, "createdAt" | "updatedAt">[] = [
  {
    id: "pet-001",
    name: "Buddy",
    species: "dog",
    breed: "Golden Retriever",
    age: 3,
    price: 50000, // $500.00
    status: "available",
    description: "Friendly and playful golden retriever. Great with kids!",
    imageUrl: null,
  },
  {
    id: "pet-002",
    name: "Whiskers",
    species: "cat",
    breed: "Persian",
    age: 2,
    price: 35000, // $350.00
    status: "available",
    description: "Fluffy Persian cat who loves to cuddle.",
    imageUrl: null,
  },
  {
    id: "pet-003",
    name: "Max",
    species: "dog",
    breed: "German Shepherd",
    age: 4,
    price: 60000, // $600.00
    status: "available",
    description: "Loyal and intelligent. Already trained in basic commands.",
    imageUrl: null,
  },
  {
    id: "pet-004",
    name: "Luna",
    species: "cat",
    breed: "Siamese",
    age: 1,
    price: 40000, // $400.00
    status: "pending",
    description: "Beautiful Siamese kitten with striking blue eyes.",
    imageUrl: null,
  },
  {
    id: "pet-005",
    name: "Charlie",
    species: "bird",
    breed: "Cockatiel",
    age: 1,
    price: 15000, // $150.00
    status: "available",
    description: "Cheerful cockatiel that can whistle tunes!",
    imageUrl: null,
  },
  {
    id: "pet-006",
    name: "Nemo",
    species: "fish",
    breed: "Clownfish",
    age: 1,
    price: 5000, // $50.00
    status: "available",
    description: "Vibrant clownfish, easy to care for.",
    imageUrl: null,
  },
  {
    id: "pet-007",
    name: "Rocky",
    species: "dog",
    breed: "Bulldog",
    age: 5,
    price: 45000, // $450.00
    status: "adopted",
    description: "Gentle bulldog who loves naps and short walks.",
    imageUrl: null,
  },
  {
    id: "pet-008",
    name: "Bella",
    species: "rabbit",
    breed: "Holland Lop",
    age: 1,
    price: 8000, // $80.00
    status: "available",
    description: "Adorable floppy-eared bunny. Very gentle.",
    imageUrl: null,
  },
];

// POST /api/pets/seed - Seed the database with sample pets
export async function POST() {
  const db = getDb();

  // Clear existing pets and insert sample data
  await db.delete(pet);

  for (const petData of samplePets) {
    await db.insert(pet).values(petData);
  }

  return Response.json({
    success: true,
    message: `Seeded ${samplePets.length} pets`,
    pets: samplePets,
  });
}
