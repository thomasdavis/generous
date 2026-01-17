import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

async function handler(request: NextRequest) {
  const { getAuth } = await import("@/lib/auth");
  const auth = getAuth();
  return auth.handler(request);
}

export { handler as GET, handler as POST };
