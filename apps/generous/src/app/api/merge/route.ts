import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";
import { componentList } from "@/lib/tool-catalog";

export const maxDuration = 60;

const MERGE_PROMPT = `You are a UI component merger. You will be given two UI component definitions in JSONL format and must intelligently combine them into a single cohesive component.

Available components:
${componentList}

Rules for merging:
1. Analyze what each component does and find a way to combine them meaningfully
2. Use a Card or Stack as the root to contain both components' content
3. Preserve the functionality of both components
4. If both have similar data (like two weather widgets), combine the data intelligently
5. If they're different types (like weather + stock), stack them in a visually appealing layout
6. Keep element keys unique - prefix them with "a_" and "b_" if needed to avoid conflicts
7. If either component has /data, merge the data objects together
8. Output valid JSONL patches in the same format

Output ONLY the merged JSONL, no explanation.`;

// Helper to parse JSONL into a tree
function parseJSONLToTree(jsonl: string): {
  root: string;
  elements: Record<string, unknown>;
  data?: Record<string, unknown>;
} | null {
  const lines = jsonl.trim().split("\n").filter(Boolean);
  let root: string | null = null;
  let data: Record<string, unknown> | undefined;
  const elements: Record<string, unknown> = {};

  for (const line of lines) {
    try {
      const patch = JSON.parse(line);
      if (patch.op === "set" && patch.path === "/root") {
        root = patch.value;
      } else if (patch.op === "set" && patch.path === "/data") {
        data = patch.value;
      } else if (patch.op === "add" && patch.path.startsWith("/elements/")) {
        const key = patch.path.replace("/elements/", "");
        elements[key] = patch.value;
      }
    } catch {
      // Skip invalid lines
    }
  }

  if (!root || Object.keys(elements).length === 0) {
    return null;
  }

  return { root, elements, data };
}

export async function POST(req: Request) {
  const body = await req.json();
  const { componentA, componentB } = body;

  if (!componentA?.jsonl || !componentB?.jsonl) {
    return Response.json({ error: "Both components must have JSONL" }, { status: 400 });
  }

  const prompt = `Merge these two components into one:

COMPONENT A (${componentA.name}):
${componentA.jsonl}

COMPONENT B (${componentB.name}):
${componentB.jsonl}

Create a merged component that combines both. The merged component should be titled something like "${componentA.name} + ${componentB.name}" or a creative combination.`;

  try {
    const result = await generateText({
      model: openai("gpt-4.1-mini"),
      system: MERGE_PROMPT,
      prompt,
      temperature: 0.3,
    });

    const jsonl = result.text;
    const tree = parseJSONLToTree(jsonl);

    if (!tree) {
      return Response.json({ error: "Failed to generate merged component" }, { status: 500 });
    }

    return Response.json({
      success: true,
      name: `${componentA.name} + ${componentB.name}`,
      jsonl,
      tree,
    });
  } catch (error) {
    console.error("Merge error:", error);
    return Response.json({ error: "Failed to merge components" }, { status: 500 });
  }
}
