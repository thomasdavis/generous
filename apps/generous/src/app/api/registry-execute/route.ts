import { type NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { toolId, params } = await req.json();

    if (!toolId || typeof toolId !== "string") {
      return NextResponse.json({ error: true, message: "toolId is required" }, { status: 400 });
    }

    // Get env vars from request header
    const envVarsHeader = req.headers.get("x-generous-env-vars");
    let envVars: Record<string, string> = {};
    if (envVarsHeader) {
      try {
        envVars = JSON.parse(envVarsHeader);
      } catch {
        // Ignore invalid JSON
      }
    }

    // Parse toolId into packageName and name
    // Format: @scope/package::toolName or package::toolName
    const parts = toolId.split("::");
    if (parts.length !== 2 || !parts[0] || !parts[1]) {
      return NextResponse.json(
        {
          error: true,
          message: `Invalid toolId format: ${toolId}. Expected format: @package/name::toolName`,
        },
        { status: 400 },
      );
    }

    const packageName = parts[0];
    const name = parts[1];

    const executorUrl = process.env.TPMJS_EXECUTOR_URL || "https://executor.tpmjs.com";

    const response = await fetch(`${executorUrl}/execute-tool`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        packageName,
        name,
        version: "latest",
        importUrl: `https://esm.sh/${packageName}`,
        params: params || {},
        env: envVars,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: true, message: `Executor error: ${response.status} ${errorText}` },
        { status: response.status },
      );
    }

    const result = await response.json();

    if (!result.success) {
      return NextResponse.json(
        { error: true, message: result.error || "Tool execution failed" },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, data: result.output });
  } catch (error) {
    return NextResponse.json(
      { error: true, message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}
