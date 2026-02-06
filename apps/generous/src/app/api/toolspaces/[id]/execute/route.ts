import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { calculateCost, estimateTokens } from "@/lib/toolspace/cost";
import { checkQuota, getRemainingQuota, recordUsage } from "@/lib/toolspace/quota";
import { validateToolExecution } from "@/lib/toolspace/validate";
import { getDb } from "@/server/db";
import { dashboard, type NewToolUsage, toolspace, toolUsage } from "@/server/db/schema";

// POST /api/toolspaces/[id]/execute - Execute a tool within toolspace constraints
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getDb();
  const body = await req.json();

  const { toolId, params: toolParams } = body;

  if (!toolId) {
    return Response.json({ error: "toolId required" }, { status: 400 });
  }

  // Get toolspace with dashboard info
  const toolspaces = await db
    .select({
      toolspace: toolspace,
      dashboardOwnerId: dashboard.ownerId,
    })
    .from(toolspace)
    .innerJoin(dashboard, eq(toolspace.dashboardId, dashboard.id))
    .where(eq(toolspace.id, id));

  if (toolspaces.length === 0) {
    return Response.json({ error: "Toolspace not found" }, { status: 404 });
  }

  const { toolspace: ts, dashboardOwnerId } = toolspaces[0];

  // Check ownership
  if (dashboardOwnerId !== session.user.id) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  // Validate tool against toolspace
  const validationError = validateToolExecution(
    toolId,
    {
      tools: ts.tools as string[],
      permissions: ts.permissions as Record<string, boolean>,
    },
    toolId.startsWith("@") ? "external" : "read",
  );

  if (validationError) {
    return Response.json({ error: validationError }, { status: 403 });
  }

  // Check quotas
  const quotaError = checkQuota(session.user.id, id, ts.quotas as Record<string, number>);

  if (quotaError) {
    return Response.json(
      {
        error: quotaError,
        quota: getRemainingQuota(session.user.id, id, ts.quotas as Record<string, number>),
      },
      { status: 429 },
    );
  }

  // Execute the tool via registry-execute
  const startTime = Date.now();
  let response: Response;
  let result: unknown;
  let status = "success";
  let error: string | undefined;

  try {
    response = await fetch(new URL("/api/registry-execute", req.url).toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        cookie: req.headers.get("cookie") || "",
      },
      body: JSON.stringify({ toolId, ...toolParams }),
    });

    result = await response.json();

    if (!response.ok) {
      status = "error";
      error = (result as { error?: string }).error || "Execution failed";
    }
  } catch (e) {
    status = "error";
    error = e instanceof Error ? e.message : "Execution failed";
    result = { error };
  }

  const executionTime = Date.now() - startTime;

  // Estimate tokens and calculate cost
  const inputTokens = estimateTokens(JSON.stringify(toolParams));
  const outputTokens = estimateTokens(JSON.stringify(result));
  const tokensUsed = inputTokens + outputTokens;

  const { costCents } = calculateCost(toolId, executionTime, tokensUsed, toolId.startsWith("@"));

  // Record usage
  recordUsage(session.user.id, id, tokensUsed, costCents);

  // Store usage record in database
  const usageRecord: NewToolUsage = {
    id: crypto.randomUUID(),
    userId: session.user.id,
    dashboardId: ts.dashboardId,
    toolId,
    executionTime,
    tokensUsed,
    costCents,
    status,
  };

  await db.insert(toolUsage).values(usageRecord);

  // Return result with usage info
  return Response.json({
    success: status === "success",
    result,
    error,
    usage: {
      executionTimeMs: executionTime,
      tokensUsed,
      costCents,
      remaining: getRemainingQuota(session.user.id, id, ts.quotas as Record<string, number>),
    },
  });
}
