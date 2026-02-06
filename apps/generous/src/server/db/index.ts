import { neon } from "@neondatabase/serverless";
import { drizzle as drizzleNeon } from "drizzle-orm/neon-http";
import { drizzle as drizzlePg } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

function createDb() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL environment variable is not set");
  }
  if (url.startsWith("postgresql://") && url.includes("localhost")) {
    const sql = postgres(url);
    return drizzlePg(sql, { schema });
  }
  const sql = neon(url);
  return drizzleNeon(sql, { schema });
}

let db: ReturnType<typeof createDb> | undefined;

export function getDb() {
  if (!db) {
    db = createDb();
  }
  return db;
}

export { db };
