import { openai } from "@ai-sdk/openai";
import { convertToModelMessages, generateText, streamText, tool } from "ai";
import { z } from "zod";
import { componentList } from "@/lib/tool-catalog";

export const maxDuration = 60;

// System prompt for generating UI components
const UI_GENERATION_PROMPT = `You are a UI generator that outputs JSONL patches for building user interfaces.

Available components:
${componentList}

Output JSONL patches in this format:
{"op":"set","path":"/root","value":"<root-element-key>"}
{"op":"add","path":"/elements/<key>","value":{"type":"<ComponentName>","props":{...},"children":[...]}}

Rules:
- First line must set /root
- Each element needs a unique key
- Children are arrays of element keys (strings)
- Props must match the component schema exactly
- Keep it simple and visually appealing
- Use realistic placeholder data that makes sense for the component type`;

const weatherTool = tool({
  description: "Get the current weather for a location",
  inputSchema: z.object({
    location: z.string().describe("The city and country"),
  }),
  execute: async ({ location }) => {
    await new Promise((r) => setTimeout(r, 500));
    const conditions = ["sunny", "cloudy", "rainy", "snowy", "partly cloudy"];
    const condition = conditions[Math.floor(Math.random() * conditions.length)];
    const temp = Math.floor(Math.random() * 30) + 5;
    const humidity = Math.floor(Math.random() * 60) + 30;
    const wind = Math.floor(Math.random() * 30) + 5;
    return {
      location,
      temperature: temp,
      unit: "celsius",
      condition,
      humidity,
      wind,
      forecast: [
        { day: "Tomorrow", high: temp + 2, low: temp - 5, condition: "sunny" },
        { day: "Wed", high: temp + 1, low: temp - 3, condition: "cloudy" },
        { day: "Thu", high: temp - 1, low: temp - 6, condition: "rainy" },
      ],
    };
  },
});

const calculatorTool = tool({
  description: "Perform a mathematical calculation",
  inputSchema: z.object({
    expression: z.string().describe("The math expression to evaluate"),
  }),
  execute: async ({ expression }) => {
    try {
      const sanitized = expression.replace(/[^0-9+\-*/().%\s]/g, "");
      const result = Function(`"use strict"; return (${sanitized})`)();
      return { expression, result };
    } catch {
      return { expression, error: "Invalid expression" };
    }
  },
});

const stockTool = tool({
  description: "Get stock price and market data for a ticker symbol",
  inputSchema: z.object({
    symbol: z.string().describe("The stock ticker symbol (e.g., AAPL, GOOGL)"),
  }),
  execute: async ({ symbol }) => {
    await new Promise((r) => setTimeout(r, 800));
    const basePrice = Math.random() * 500 + 50;
    const change = (Math.random() - 0.5) * 20;
    const changePercent = (change / basePrice) * 100;

    const history = Array.from({ length: 20 }, (_, i) => ({
      time: i,
      price: basePrice + (Math.random() - 0.5) * 30,
    }));

    return {
      symbol: symbol.toUpperCase(),
      price: Number(basePrice.toFixed(2)),
      change: Number(change.toFixed(2)),
      changePercent: Number(changePercent.toFixed(2)),
      high: Number((basePrice + Math.abs(change) + 5).toFixed(2)),
      low: Number((basePrice - Math.abs(change) - 5).toFixed(2)),
      volume: `${(Math.random() * 50 + 10).toFixed(1)}M`,
      marketCap: `${(Math.random() * 2000 + 100).toFixed(0)}B`,
      history,
    };
  },
});

const searchTool = tool({
  description: "Search the web for information on a topic",
  inputSchema: z.object({
    query: z.string().describe("The search query"),
  }),
  execute: async ({ query }) => {
    await new Promise((r) => setTimeout(r, 600));

    const results = [
      {
        title: `${query} - Wikipedia`,
        url: `https://en.wikipedia.org/wiki/${encodeURIComponent(query)}`,
        snippet: `${query} is a topic of significant interest. This article covers the main aspects and history of ${query.toLowerCase()}.`,
      },
      {
        title: `Understanding ${query} | Complete Guide`,
        url: `https://example.com/guide/${encodeURIComponent(query.toLowerCase())}`,
        snippet: `A comprehensive guide to understanding ${query.toLowerCase()}. Learn everything you need to know about this subject.`,
      },
      {
        title: `${query} News and Updates`,
        url: `https://news.example.com/${encodeURIComponent(query.toLowerCase())}`,
        snippet: `Latest news and updates about ${query.toLowerCase()}. Stay informed with breaking stories and analysis.`,
      },
    ];

    return {
      query,
      totalResults: Math.floor(Math.random() * 1000000) + 100000,
      results,
    };
  },
});

const timerTool = tool({
  description: "Set a countdown timer for a specified duration",
  inputSchema: z.object({
    seconds: z.number().describe("Duration in seconds (max 60)"),
    label: z.string().optional().describe("Optional label for the timer"),
  }),
  execute: async ({ seconds, label }) => {
    const duration = Math.min(seconds, 60);
    return {
      duration,
      label: label || "Timer",
      startedAt: Date.now(),
      endsAt: Date.now() + duration * 1000,
    };
  },
});

// Helper to parse JSONL into a tree
function parseJSONLToTree(
  jsonl: string,
): { root: string; elements: Record<string, unknown> } | null {
  const lines = jsonl.trim().split("\n").filter(Boolean);
  let root: string | null = null;
  const elements: Record<string, unknown> = {};

  for (const line of lines) {
    try {
      const patch = JSON.parse(line);
      if (patch.op === "set" && patch.path === "/root") {
        root = patch.value;
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

  return { root, elements };
}

const createComponentTool = tool({
  description:
    "Create a new persistent UI widget/component that will be added to the user's dashboard. Use this when the user asks to 'build', 'create', 'add', or 'make' a widget, card, dashboard component, or any persistent UI element.",
  inputSchema: z.object({
    name: z
      .string()
      .describe(
        "A short name for the component (e.g., 'Weather Widget', 'Stock Tracker', 'Todo List')",
      ),
    description: z
      .string()
      .describe(
        "A detailed description of what the component should display and how it should look",
      ),
    dataContext: z
      .string()
      .optional()
      .describe("Any specific data or context to include (e.g., 'Bitcoin price', 'Tokyo weather')"),
  }),
  execute: async ({ name, description, dataContext }) => {
    // Generate the UI using the same model
    const prompt = `Create a UI component for: ${name}

Description: ${description}
${dataContext ? `Data context: ${dataContext}` : ""}

Generate a visually appealing component using the available components. Use realistic sample data.`;

    const result = await generateText({
      model: openai("gpt-4.1-mini"),
      system: UI_GENERATION_PROMPT,
      prompt,
      temperature: 0.3,
    });

    const jsonl = result.text;
    const tree = parseJSONLToTree(jsonl);

    if (!tree) {
      return {
        _isComponent: true,
        success: false,
        error: "Failed to generate component",
        name,
      };
    }

    return {
      _isComponent: true,
      success: true,
      name,
      jsonl,
      tree,
    };
  },
});

const tools = {
  weather: weatherTool,
  calculator: calculatorTool,
  stock: stockTool,
  search: searchTool,
  timer: timerTool,
  createComponent: createComponentTool,
};

export async function POST(req: Request) {
  const body = await req.json();
  const messages = body.messages ?? [];

  if (!messages.length) {
    return new Response("No messages provided", { status: 400 });
  }

  const modelMessages = await convertToModelMessages(messages, { tools });

  const result = streamText({
    model: openai("gpt-4.1-mini"),
    system: `You are a helpful assistant with access to several tools:
- weather: Get current weather and forecast for any location
- calculator: Perform math calculations
- stock: Get stock prices and market data for ticker symbols
- search: Search the web for information
- timer: Set countdown timers
- createComponent: Create persistent UI widgets that stay on the user's dashboard

IMPORTANT: When a user asks to "build", "create", "add", or "make" a widget, component, card, or dashboard element, use the createComponent tool. This creates a persistent widget that stays on their dashboard and can be moved around.

Examples of when to use createComponent:
- "Build me a weather widget for Tokyo"
- "Create a stock tracker for AAPL"
- "Add a todo list to my dashboard"
- "Make a crypto price card for Bitcoin"

Be concise and friendly. Use tools when they would be helpful to answer the user's question.`,
    messages: modelMessages,
    tools,
  });

  return result.toUIMessageStreamResponse();
}
