export interface UITree {
  root: string;
  elements: Record<string, unknown>;
  data?: Record<string, unknown>;
}

// Try to parse JSON, handling common AI-generated errors like extra trailing braces
function tryParseJSON(line: string): unknown | null {
  try {
    return JSON.parse(line);
  } catch {
    // Try trimming extra trailing braces (common AI generation error)
    let trimmed = line;
    while (trimmed.endsWith("}")) {
      trimmed = trimmed.slice(0, -1);
      try {
        return JSON.parse(trimmed);
      } catch {}
    }
    console.warn("[parseJSONLToTree] Failed to parse line:", line.substring(0, 100));
    return null;
  }
}

// Parse JSONL into a UITree
export function parseJSONLToTree(jsonl: string): UITree | null {
  const lines = jsonl.trim().split("\n").filter(Boolean);
  let root: string | null = null;
  let data: Record<string, unknown> | undefined;
  const elements: Record<string, unknown> = {};

  for (const line of lines) {
    const patch = tryParseJSON(line) as {
      op?: string;
      path?: string;
      value?: unknown;
    } | null;
    if (!patch) continue;

    if (patch.op === "set" && patch.path === "/root") {
      root = patch.value as string;
    } else if (patch.op === "set" && patch.path === "/data") {
      data = patch.value as Record<string, unknown>;
    } else if (patch.op === "add" && patch.path?.startsWith("/elements/")) {
      const key = patch.path.replace("/elements/", "");
      elements[key] = patch.value;
    }
  }

  if (!root || Object.keys(elements).length === 0) {
    return null;
  }

  return { root, elements, data };
}
