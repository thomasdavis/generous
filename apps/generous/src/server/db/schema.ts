import { boolean, integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";

// ============================================
// Pets table (example API data)
// ============================================

export const pet = pgTable("pet", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  species: text("species").notNull(), // dog, cat, bird, fish, etc.
  breed: text("breed"),
  age: integer("age"), // in years
  price: integer("price").notNull(), // in cents
  status: text("status").notNull().default("available"), // available, adopted, pending
  description: text("description"),
  imageUrl: text("image_url"),
  categoryId: text("category_id"),
  tags: text("tags"), // JSON array of tags
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type Pet = typeof pet.$inferSelect;
export type NewPet = typeof pet.$inferInsert;

// ============================================
// Categories table
// ============================================

export const category = pgTable("category", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type Category = typeof category.$inferSelect;
export type NewCategory = typeof category.$inferInsert;

// ============================================
// Customers table
// ============================================

export const customer = pgTable("customer", {
  id: text("id").primaryKey(),
  userId: text("user_id").references(() => user.id), // optional link to auth user
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  address: text("address"),
  city: text("city"),
  state: text("state"),
  zipCode: text("zip_code"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type Customer = typeof customer.$inferSelect;
export type NewCustomer = typeof customer.$inferInsert;

// ============================================
// Orders table
// ============================================

export const order = pgTable("order", {
  id: text("id").primaryKey(),
  customerId: text("customer_id")
    .notNull()
    .references(() => customer.id),
  petId: text("pet_id")
    .notNull()
    .references(() => pet.id),
  status: text("status").notNull().default("placed"), // placed, approved, delivered, cancelled
  quantity: integer("quantity").notNull().default(1),
  totalPrice: integer("total_price").notNull(), // in cents
  shipDate: timestamp("ship_date"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type Order = typeof order.$inferSelect;
export type NewOrder = typeof order.$inferInsert;

// ============================================
// Inventory table
// ============================================

export const inventory = pgTable("inventory", {
  id: text("id").primaryKey(),
  itemName: text("item_name").notNull(),
  itemType: text("item_type").notNull(), // food, toy, accessory, medicine, etc.
  species: text("species"), // which species this is for (null = all)
  quantity: integer("quantity").notNull().default(0),
  unitPrice: integer("unit_price").notNull(), // in cents
  reorderLevel: integer("reorder_level").default(10),
  supplier: text("supplier"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type Inventory = typeof inventory.$inferSelect;
export type NewInventory = typeof inventory.$inferInsert;

// ============================================
// Store Info table (singleton for store settings)
// ============================================

export const storeInfo = pgTable("store_info", {
  id: text("id").primaryKey().default("store"),
  name: text("name").notNull().default("Pet Paradise"),
  address: text("address"),
  phone: text("phone"),
  email: text("email"),
  openingHours: text("opening_hours"), // JSON
  isOpen: boolean("is_open").notNull().default(true),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type StoreInfo = typeof storeInfo.$inferSelect;

// ============================================
// Auth tables
// ============================================

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at"),
});
