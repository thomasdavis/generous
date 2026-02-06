import { boolean, integer, jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";

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

// ============================================
// Dashboard tables (Application OS)
// ============================================

export const dashboard = pgTable("dashboard", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
  ownerId: text("owner_id")
    .notNull()
    .references(() => user.id),
  isPublic: boolean("is_public").notNull().default(false),
  components: jsonb("components").$type<unknown[]>().default([]),
  gridLayout: jsonb("grid_layout").$type<unknown[]>().default([]),
  settings: jsonb("settings").$type<Record<string, unknown>>().default({}),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type Dashboard = typeof dashboard.$inferSelect;
export type NewDashboard = typeof dashboard.$inferInsert;

export const dashboardVersion = pgTable("dashboard_version", {
  id: text("id").primaryKey(),
  dashboardId: text("dashboard_id")
    .notNull()
    .references(() => dashboard.id, { onDelete: "cascade" }),
  version: integer("version").notNull(),
  components: jsonb("components").$type<unknown[]>().notNull(),
  gridLayout: jsonb("grid_layout").$type<unknown[]>().notNull(),
  createdBy: text("created_by").references(() => user.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  comment: text("comment"),
});

export type DashboardVersion = typeof dashboardVersion.$inferSelect;
export type NewDashboardVersion = typeof dashboardVersion.$inferInsert;

export const dashboardCollaborator = pgTable("dashboard_collaborator", {
  id: text("id").primaryKey(),
  dashboardId: text("dashboard_id")
    .notNull()
    .references(() => dashboard.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  role: text("role").notNull().default("viewer"), // viewer, editor, admin
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type DashboardCollaborator = typeof dashboardCollaborator.$inferSelect;
export type NewDashboardCollaborator = typeof dashboardCollaborator.$inferInsert;

// ============================================
// Workflow tables (ToolNode Dataflow)
// ============================================

export const workflow = pgTable("workflow", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  ownerId: text("owner_id")
    .notNull()
    .references(() => user.id),
  dashboardId: text("dashboard_id").references(() => dashboard.id, { onDelete: "set null" }),
  nodes: jsonb("nodes").$type<unknown[]>().default([]),
  edges: jsonb("edges").$type<unknown[]>().default([]),
  variables: jsonb("variables").$type<Record<string, unknown>>().default({}),
  triggerConfig: jsonb("trigger_config").$type<Record<string, unknown>>().default({}),
  isEnabled: boolean("is_enabled").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type Workflow = typeof workflow.$inferSelect;
export type NewWorkflow = typeof workflow.$inferInsert;

export const workflowExecution = pgTable("workflow_execution", {
  id: text("id").primaryKey(),
  workflowId: text("workflow_id")
    .notNull()
    .references(() => workflow.id, { onDelete: "cascade" }),
  status: text("status").notNull().default("pending"), // pending, running, completed, failed
  triggeredBy: text("triggered_by"), // manual, cron, webhook
  triggeredAt: timestamp("triggered_at").notNull().defaultNow(),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  nodeResults: jsonb("node_results").$type<Record<string, unknown>>().default({}),
  error: text("error"),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}),
});

export type WorkflowExecution = typeof workflowExecution.$inferSelect;
export type NewWorkflowExecution = typeof workflowExecution.$inferInsert;

// ============================================
// Trigger tables (Webhooks & Scheduling)
// ============================================

export const webhook = pgTable("webhook", {
  id: text("id").primaryKey(),
  workflowId: text("workflow_id")
    .notNull()
    .references(() => workflow.id, { onDelete: "cascade" }),
  secret: text("secret").notNull(),
  url: text("url").notNull().unique(),
  isEnabled: boolean("is_enabled").notNull().default(true),
  lastTriggered: timestamp("last_triggered"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type Webhook = typeof webhook.$inferSelect;
export type NewWebhook = typeof webhook.$inferInsert;

export const scheduledJob = pgTable("scheduled_job", {
  id: text("id").primaryKey(),
  workflowId: text("workflow_id")
    .notNull()
    .references(() => workflow.id, { onDelete: "cascade" }),
  cronExpression: text("cron_expression").notNull(),
  timezone: text("timezone").notNull().default("UTC"),
  isEnabled: boolean("is_enabled").notNull().default(true),
  lastRun: timestamp("last_run"),
  nextRun: timestamp("next_run"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type ScheduledJob = typeof scheduledJob.$inferSelect;
export type NewScheduledJob = typeof scheduledJob.$inferInsert;

// ============================================
// Toolspace tables (Permissions & Quotas)
// ============================================

export const toolspace = pgTable("toolspace", {
  id: text("id").primaryKey(),
  dashboardId: text("dashboard_id")
    .notNull()
    .references(() => dashboard.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  tools: jsonb("tools").$type<string[]>().default([]), // Array of tool patterns like "@stripe/*"
  permissions: jsonb("permissions").$type<Record<string, unknown>>().default({}),
  quotas: jsonb("quotas").$type<Record<string, unknown>>().default({}),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type Toolspace = typeof toolspace.$inferSelect;
export type NewToolspace = typeof toolspace.$inferInsert;

export const toolUsage = pgTable("tool_usage", {
  id: text("id").primaryKey(),
  userId: text("user_id").references(() => user.id),
  dashboardId: text("dashboard_id").references(() => dashboard.id),
  workflowId: text("workflow_id").references(() => workflow.id),
  toolId: text("tool_id").notNull(),
  executionTime: integer("execution_time"), // in milliseconds
  tokensUsed: integer("tokens_used"),
  costCents: integer("cost_cents"),
  status: text("status").notNull().default("success"), // success, error, timeout
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type ToolUsage = typeof toolUsage.$inferSelect;
export type NewToolUsage = typeof toolUsage.$inferInsert;

// ============================================
// Template tables (Marketplace)
// ============================================

export const template = pgTable("template", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  category: text("category").notNull(),
  authorId: text("author_id")
    .notNull()
    .references(() => user.id),
  content: jsonb("content").$type<Record<string, unknown>>().notNull(), // Dashboard export format
  thumbnail: text("thumbnail"),
  isPublished: boolean("is_published").notNull().default(false),
  downloads: integer("downloads").notNull().default(0),
  rating: integer("rating"), // Average rating * 100 (e.g., 450 = 4.50)
  ratingCount: integer("rating_count").notNull().default(0),
  tags: jsonb("tags").$type<string[]>().default([]),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type Template = typeof template.$inferSelect;
export type NewTemplate = typeof template.$inferInsert;

export const templateUsage = pgTable("template_usage", {
  id: text("id").primaryKey(),
  templateId: text("template_id")
    .notNull()
    .references(() => template.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
  instantiatedId: text("instantiated_id").references(() => dashboard.id), // The created dashboard
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type TemplateUsage = typeof templateUsage.$inferSelect;
export type NewTemplateUsage = typeof templateUsage.$inferInsert;

export const templateRating = pgTable("template_rating", {
  id: text("id").primaryKey(),
  templateId: text("template_id")
    .notNull()
    .references(() => template.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
  rating: integer("rating").notNull(), // 1-5
  comment: text("comment"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
