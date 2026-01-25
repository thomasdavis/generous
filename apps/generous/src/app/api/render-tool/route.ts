import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";
import { componentList } from "@/lib/tool-catalog";

export const maxDuration = 30;

const SYSTEM_PROMPT = `You are a UI generator that outputs JSONL (JSON Lines) patches to render tool results.

AVAILABLE COMPONENTS:
${componentList}

COMPONENT DETAILS:
- Card: { title?: string, variant?: "default"|"gradient"|"outline", padding?: "sm"|"md"|"lg" } - Container, use variant="gradient" for weather
- Grid: { columns?: 1-4, gap?: "sm"|"md"|"lg" } - Grid layout
- Stack: { direction?: "horizontal"|"vertical", gap?: "sm"|"md"|"lg", align?: "start"|"center"|"end"|"stretch" }
- Metric: { label: string, value: string, unit?: string, trend?: "up"|"down"|"neutral", trendValue?: string, size?: "sm"|"md"|"lg"|"xl" }
- Sparkline: { data: number[], color?: "green"|"red"|"blue"|"gray", height?: number }
- ProgressBar: { value: number, max?: number, label?: string, color?: "blue"|"green"|"yellow"|"red" }
- WeatherIcon: { condition: "sunny"|"cloudy"|"rainy"|"snowy"|"partly cloudy"|"stormy", size?: "sm"|"md"|"lg" }
- ForecastDay: { day: string, high: number, low: number, condition: string }
- PriceChange: { change: number, changePercent: number }
- StockStat: { label: string, value: string }
- SearchResult: { title: string, url: string, snippet: string }
- Heading: { text: string, level?: "h1"|"h2"|"h3"|"h4" }
- Text: { content: string, variant?: "body"|"caption"|"label", color?: "default"|"muted"|"success"|"warning"|"danger" }
- Badge: { text: string, variant?: "default"|"success"|"warning"|"danger"|"info" }
- Divider: { label?: string }
- Timer: { duration: number, label?: string, endsAt: number }
- Calculation: { expression: string, result: string }

OUTPUT FORMAT:
Output JSONL where each line is a patch operation:
- {"op":"set","path":"/root","value":"key"} - Set root element
- {"op":"add","path":"/elements/key","value":{...}} - Add element

ELEMENT STRUCTURE:
{
  "key": "unique-key",
  "type": "ComponentType",
  "props": { ... },
  "children": ["child-key-1"]  // Array of child keys (strings)
}

RULES:
1. First set /root
2. Add each element with unique key via /elements/{key}
3. Children array contains STRING KEYS only
4. Stream progressively - parent first, then children
5. Make it visually appealing - use appropriate components for the data

TOOL-SPECIFIC GUIDELINES:

WEATHER: Use Card with variant="gradient" (blue), WeatherIcon, Metric for temp, Stack for details, ForecastDay for forecast

STOCK: Use Card, large Metric for price, PriceChange for change, Sparkline for history, Grid of StockStat for stats

SEARCH: Use Card with title showing query, Stack of SearchResult items

CALCULATOR: Use Card, Calculation component

TIMER: Use Card, Timer component

Generate JSONL now for the tool data:`;

export async function POST(req: Request) {
  const { toolName, toolData } = await req.json();

  const prompt = `Tool: ${toolName}
Data: ${JSON.stringify(toolData, null, 2)}

Generate a beautiful UI for this ${toolName} tool result.`;

  const result = streamText({
    model: openai("gpt-4.1-mini"),
    system: SYSTEM_PROMPT,
    prompt,
    temperature: 0.3,
  });

  return result.toTextStreamResponse();
}
