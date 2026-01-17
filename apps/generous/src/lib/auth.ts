import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { getDb } from "@/server/db";
import * as schema from "@/server/db/schema";

let authInstance: ReturnType<typeof betterAuth> | undefined;

export function getAuth() {
  if (!authInstance) {
    authInstance = betterAuth({
      database: drizzleAdapter(getDb(), {
        provider: "pg",
        schema: {
          user: schema.user,
          session: schema.session,
          account: schema.account,
          verification: schema.verification,
        },
      }),
      emailAndPassword: {
        enabled: true,
      },
    });
  }
  return authInstance;
}

export const auth = {
  get handler() {
    return getAuth().handler;
  },
  get api() {
    return getAuth().api;
  },
};
