import { createCatalog } from "@json-render/core";
import { z } from "zod";

/**
 * Tool UI Component Catalog
 *
 * Defines ALL components the AI can use to render tool results.
 * This acts as a guardrail - AI cannot create arbitrary HTML/CSS.
 */
export const toolCatalog = createCatalog({
  name: "tool-ui",
  components: {
    // Interactive Components
    Button: {
      props: z.object({
        label: z.string(),
        action: z
          .object({
            name: z.string(),
            params: z.record(z.string(), z.unknown()).optional(),
          })
          .optional(),
        variant: z.enum(["primary", "secondary", "outline", "danger"]).nullable(),
        size: z.enum(["sm", "md", "lg"]).nullable(),
      }),
      description:
        "Clickable button that triggers an action. Available actions: set, toggleColor, increment, toggle",
    },

    InteractiveCard: {
      props: z.object({
        title: z.string().nullable(),
        colorPath: z.string().nullable(),
        action: z
          .object({
            name: z.string(),
            params: z.record(z.string(), z.unknown()).optional(),
          })
          .optional(),
        padding: z.enum(["sm", "md", "lg"]).nullable(),
      }),
      hasChildren: true,
      description:
        "Card that reads its color from a data path and triggers an action on click. Use with toggleColor action.",
    },

    // Layout
    Card: {
      props: z.object({
        title: z.string().nullable(),
        variant: z.enum(["default", "gradient", "outline"]).nullable(),
        padding: z.enum(["sm", "md", "lg"]).nullable(),
      }),
      hasChildren: true,
      description: "Container card with optional title",
    },

    Grid: {
      props: z.object({
        columns: z.number().min(1).max(4).nullable(),
        gap: z.enum(["sm", "md", "lg"]).nullable(),
      }),
      hasChildren: true,
      description: "Grid layout",
    },

    Stack: {
      props: z.object({
        direction: z.enum(["horizontal", "vertical"]).nullable(),
        gap: z.enum(["sm", "md", "lg"]).nullable(),
        align: z.enum(["start", "center", "end", "stretch"]).nullable(),
      }),
      hasChildren: true,
      description: "Flex stack layout",
    },

    // Data Display
    Metric: {
      props: z.object({
        label: z.string(),
        value: z.string(),
        unit: z.string().nullable(),
        trend: z.enum(["up", "down", "neutral"]).nullable(),
        trendValue: z.string().nullable(),
        size: z.enum(["sm", "md", "lg", "xl"]).nullable(),
      }),
      description: "Display a metric with label, value, and optional trend",
    },

    Sparkline: {
      props: z.object({
        data: z.array(z.number()),
        color: z.enum(["green", "red", "blue", "gray"]).nullable(),
        height: z.number().nullable(),
      }),
      description: "Small inline chart",
    },

    ProgressBar: {
      props: z.object({
        value: z.number(),
        max: z.number().nullable(),
        label: z.string().nullable(),
        color: z.enum(["blue", "green", "yellow", "red"]).nullable(),
      }),
      description: "Progress indicator bar",
    },

    // Weather specific
    WeatherIcon: {
      props: z.object({
        condition: z.enum(["sunny", "cloudy", "rainy", "snowy", "partly cloudy", "stormy"]),
        size: z.enum(["sm", "md", "lg"]).nullable(),
      }),
      description: "Weather condition icon",
    },

    ForecastDay: {
      props: z.object({
        day: z.string(),
        high: z.number(),
        low: z.number(),
        condition: z.string(),
      }),
      description: "Single day forecast",
    },

    // Stock specific
    PriceChange: {
      props: z.object({
        change: z.number(),
        changePercent: z.number(),
      }),
      description: "Price change indicator with color",
    },

    StockStat: {
      props: z.object({
        label: z.string(),
        value: z.string(),
      }),
      description: "Stock statistic item",
    },

    // Search specific
    SearchResult: {
      props: z.object({
        title: z.string(),
        url: z.string(),
        snippet: z.string(),
      }),
      description: "Single search result with title, URL, snippet",
    },

    // Typography
    Heading: {
      props: z.object({
        text: z.string(),
        level: z.enum(["h1", "h2", "h3", "h4"]).nullable(),
      }),
      description: "Section heading",
    },

    Text: {
      props: z.object({
        content: z.string(),
        variant: z.enum(["body", "caption", "label"]).nullable(),
        color: z.enum(["default", "muted", "success", "warning", "danger"]).nullable(),
      }),
      description: "Text content",
    },

    // Status
    Badge: {
      props: z.object({
        text: z.string(),
        variant: z.enum(["default", "success", "warning", "danger", "info"]).nullable(),
      }),
      description: "Status badge",
    },

    Divider: {
      props: z.object({
        label: z.string().nullable(),
      }),
      description: "Visual divider",
    },

    // Timer
    Timer: {
      props: z.object({
        duration: z.number(),
        label: z.string().nullable(),
        endsAt: z.number(),
      }),
      description: "Countdown timer display",
    },

    // Calculator
    Calculation: {
      props: z.object({
        expression: z.string(),
        result: z.string(),
      }),
      description: "Math calculation display",
    },
  },
});

// Generate a human-readable component list for the AI
export const componentList = `
INTERACTIVE COMPONENTS (for user interaction):
Button: Clickable button with label, action, variant (primary|secondary|outline|danger), size.
  - action: { name: "toggleColor"|"set"|"increment"|"toggle", params: { path: "/dataKey", ... } }
InteractiveCard: Card that changes color on click. Props: title, colorPath, action, padding.
  - colorPath: data path to read color from (e.g., "/card1Color")
  - action: { name: "toggleColor", params: { path: "/card1Color" } }
  - Colors: blue, green, red, purple, orange, yellow, pink, teal

INITIAL DATA: For interactive components, include a "data" property in your tree:
  {"op":"set","path":"/data","value":{"card1Color":"blue","card2Color":"green"}}

LAYOUT COMPONENTS:
Card: Container with optional title and variant (default|gradient|outline). Has children.
Grid: Grid layout with columns (1-4) and gap (sm|md|lg). Has children.
Stack: Flex layout with direction (horizontal|vertical), gap, align. Has children.

DATA DISPLAY:
Metric: Data display with label, value, unit, trend (up|down|neutral), trendValue, size.
Sparkline: Inline chart with data (number array), color (green|red|blue|gray), height.
ProgressBar: Progress with value, max, label, color (blue|green|yellow|red).
WeatherIcon: Weather icon with condition (sunny|cloudy|rainy|snowy|partly cloudy|stormy), size.
ForecastDay: Forecast with day, high, low, condition.
PriceChange: Price change with change and changePercent numbers.
StockStat: Stock stat with label and value strings.
SearchResult: Search result with title, url, snippet.

TYPOGRAPHY & STATUS:
Heading: Heading with text and level (h1|h2|h3|h4).
Text: Text with content, variant (body|caption|label), color (default|muted|success|warning|danger).
Badge: Status badge with text and variant (default|success|warning|danger|info).
Divider: Visual divider with optional label.
Timer: Countdown with duration (seconds), label, endsAt (timestamp).
Calculation: Math display with expression and result strings.
`;
