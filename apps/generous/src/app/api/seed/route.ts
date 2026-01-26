import { getDb } from "@/server/db";
import {
  category,
  customer,
  inventory,
  type NewCategory,
  type NewCustomer,
  type NewInventory,
  type NewOrder,
  type NewPet,
  order,
  pet,
  storeInfo,
} from "@/server/db/schema";

// POST /api/seed - Seed the database with sample data
export async function POST() {
  const db = getDb();

  // Seed categories
  const categories: NewCategory[] = [
    { id: "cat-dogs", name: "Dogs", description: "Man's best friend" },
    { id: "cat-cats", name: "Cats", description: "Independent and loving companions" },
    { id: "cat-birds", name: "Birds", description: "Beautiful feathered friends" },
    { id: "cat-fish", name: "Fish", description: "Peaceful aquatic pets" },
    { id: "cat-small", name: "Small Animals", description: "Rabbits, hamsters, and more" },
  ];

  for (const cat of categories) {
    await db.insert(category).values(cat).onConflictDoNothing();
  }

  // Seed pets
  const pets: NewPet[] = [
    {
      id: "pet-1",
      name: "Max",
      species: "dog",
      breed: "Golden Retriever",
      age: 3,
      price: 49900,
      status: "available",
      description: "Friendly and energetic golden retriever, great with kids!",
      categoryId: "cat-dogs",
    },
    {
      id: "pet-2",
      name: "Luna",
      species: "cat",
      breed: "Siamese",
      age: 2,
      price: 35000,
      status: "available",
      description: "Elegant Siamese cat with striking blue eyes",
      categoryId: "cat-cats",
    },
    {
      id: "pet-3",
      name: "Charlie",
      species: "dog",
      breed: "Labrador",
      age: 1,
      price: 45000,
      status: "available",
      description: "Playful black lab puppy, loves to fetch!",
      categoryId: "cat-dogs",
    },
    {
      id: "pet-4",
      name: "Milo",
      species: "cat",
      breed: "Maine Coon",
      age: 4,
      price: 55000,
      status: "pending",
      description: "Gentle giant with a fluffy coat",
      categoryId: "cat-cats",
    },
    {
      id: "pet-5",
      name: "Tweety",
      species: "bird",
      breed: "Canary",
      age: 1,
      price: 15000,
      status: "available",
      description: "Beautiful yellow canary with a lovely song",
      categoryId: "cat-birds",
    },
    {
      id: "pet-6",
      name: "Nemo",
      species: "fish",
      breed: "Clownfish",
      age: 1,
      price: 2500,
      status: "available",
      description: "Vibrant orange clownfish",
      categoryId: "cat-fish",
    },
    {
      id: "pet-7",
      name: "Bun Bun",
      species: "rabbit",
      breed: "Holland Lop",
      age: 2,
      price: 12000,
      status: "available",
      description: "Adorable lop-eared bunny, very cuddly",
      categoryId: "cat-small",
    },
    {
      id: "pet-8",
      name: "Bella",
      species: "dog",
      breed: "French Bulldog",
      age: 2,
      price: 75000,
      status: "available",
      description: "Compact and charming Frenchie",
      categoryId: "cat-dogs",
    },
    {
      id: "pet-9",
      name: "Oliver",
      species: "cat",
      breed: "British Shorthair",
      age: 3,
      price: 40000,
      status: "adopted",
      description: "Calm and collected British gentleman",
      categoryId: "cat-cats",
    },
    {
      id: "pet-10",
      name: "Rocky",
      species: "dog",
      breed: "German Shepherd",
      age: 4,
      price: 55000,
      status: "available",
      description: "Loyal and intelligent, great guard dog",
      categoryId: "cat-dogs",
    },
  ];

  for (const p of pets) {
    await db.insert(pet).values(p).onConflictDoNothing();
  }

  // Seed customers
  const customers: NewCustomer[] = [
    {
      id: "cust-1",
      firstName: "John",
      lastName: "Smith",
      email: "john.smith@example.com",
      phone: "(555) 111-2222",
      address: "123 Main St",
      city: "Springfield",
      state: "IL",
      zipCode: "62701",
    },
    {
      id: "cust-2",
      firstName: "Sarah",
      lastName: "Johnson",
      email: "sarah.j@example.com",
      phone: "(555) 333-4444",
      address: "456 Oak Ave",
      city: "Portland",
      state: "OR",
      zipCode: "97201",
    },
    {
      id: "cust-3",
      firstName: "Michael",
      lastName: "Williams",
      email: "m.williams@example.com",
      phone: "(555) 555-6666",
      address: "789 Pine Rd",
      city: "Austin",
      state: "TX",
      zipCode: "78701",
    },
    {
      id: "cust-4",
      firstName: "Emily",
      lastName: "Brown",
      email: "emily.brown@example.com",
      phone: "(555) 777-8888",
      address: "321 Elm St",
      city: "Seattle",
      state: "WA",
      zipCode: "98101",
    },
    {
      id: "cust-5",
      firstName: "David",
      lastName: "Garcia",
      email: "d.garcia@example.com",
      phone: "(555) 999-0000",
      address: "654 Maple Dr",
      city: "Denver",
      state: "CO",
      zipCode: "80201",
    },
  ];

  for (const c of customers) {
    await db.insert(customer).values(c).onConflictDoNothing();
  }

  // Seed orders
  const orders: NewOrder[] = [
    {
      id: "order-1",
      customerId: "cust-1",
      petId: "pet-9",
      status: "delivered",
      quantity: 1,
      totalPrice: 40000,
      shipDate: new Date("2024-01-15"),
      notes: "Happy customer!",
    },
    {
      id: "order-2",
      customerId: "cust-2",
      petId: "pet-4",
      status: "approved",
      quantity: 1,
      totalPrice: 55000,
      notes: "Pickup scheduled for weekend",
    },
    {
      id: "order-3",
      customerId: "cust-3",
      petId: "pet-1",
      status: "placed",
      quantity: 1,
      totalPrice: 49900,
    },
  ];

  for (const o of orders) {
    await db.insert(order).values(o).onConflictDoNothing();
  }

  // Seed inventory
  const inventoryItems: NewInventory[] = [
    {
      id: "inv-1",
      itemName: "Premium Dog Food (Large Bag)",
      itemType: "food",
      species: "dog",
      quantity: 45,
      unitPrice: 4999,
      reorderLevel: 10,
      supplier: "PetCo Distributors",
    },
    {
      id: "inv-2",
      itemName: "Cat Food (Salmon)",
      itemType: "food",
      species: "cat",
      quantity: 60,
      unitPrice: 2999,
      reorderLevel: 15,
      supplier: "PetCo Distributors",
    },
    {
      id: "inv-3",
      itemName: "Dog Leash (Medium)",
      itemType: "accessory",
      species: "dog",
      quantity: 8,
      unitPrice: 1499,
      reorderLevel: 10,
      supplier: "Pet Supplies Inc",
    },
    {
      id: "inv-4",
      itemName: "Cat Scratching Post",
      itemType: "toy",
      species: "cat",
      quantity: 12,
      unitPrice: 3499,
      reorderLevel: 5,
      supplier: "Pet Supplies Inc",
    },
    {
      id: "inv-5",
      itemName: "Bird Seed Mix",
      itemType: "food",
      species: "bird",
      quantity: 30,
      unitPrice: 1299,
      reorderLevel: 10,
      supplier: "Avian Foods Co",
    },
    {
      id: "inv-6",
      itemName: "Fish Tank Filter",
      itemType: "accessory",
      species: "fish",
      quantity: 5,
      unitPrice: 2499,
      reorderLevel: 8,
      supplier: "Aquatic World",
    },
    {
      id: "inv-7",
      itemName: "Flea & Tick Medicine (Dog)",
      itemType: "medicine",
      species: "dog",
      quantity: 25,
      unitPrice: 3999,
      reorderLevel: 10,
      supplier: "VetMed Supplies",
    },
    {
      id: "inv-8",
      itemName: "Squeaky Toy (Set of 3)",
      itemType: "toy",
      species: "dog",
      quantity: 40,
      unitPrice: 999,
      reorderLevel: 15,
      supplier: "Pet Supplies Inc",
    },
    {
      id: "inv-9",
      itemName: "Catnip Spray",
      itemType: "toy",
      species: "cat",
      quantity: 3,
      unitPrice: 799,
      reorderLevel: 10,
      supplier: "Pet Supplies Inc",
    },
    {
      id: "inv-10",
      itemName: "Rabbit Hay (Bulk)",
      itemType: "food",
      species: "rabbit",
      quantity: 20,
      unitPrice: 1999,
      reorderLevel: 8,
      supplier: "Farm Fresh Feeds",
    },
  ];

  for (const item of inventoryItems) {
    await db.insert(inventory).values(item).onConflictDoNothing();
  }

  // Seed store info
  await db
    .insert(storeInfo)
    .values({
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
    })
    .onConflictDoNothing();

  return Response.json({
    success: true,
    seeded: {
      categories: categories.length,
      pets: pets.length,
      customers: customers.length,
      orders: orders.length,
      inventory: inventoryItems.length,
    },
  });
}

// GET /api/seed - Check seed status
export async function GET() {
  const db = getDb();

  const petCount = await db.select().from(pet);
  const categoryCount = await db.select().from(category);
  const customerCount = await db.select().from(customer);
  const orderCount = await db.select().from(order);
  const inventoryCount = await db.select().from(inventory);

  return Response.json({
    counts: {
      pets: petCount.length,
      categories: categoryCount.length,
      customers: customerCount.length,
      orders: orderCount.length,
      inventory: inventoryCount.length,
    },
    needsSeed: petCount.length === 0 || categoryCount.length === 0 || customerCount.length === 0,
  });
}
