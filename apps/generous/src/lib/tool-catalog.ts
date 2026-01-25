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

    // Dynamic Data Components
    DataList: {
      props: z.object({
        endpoint: z.string(),
        dataKey: z.string().nullable(),
        emptyMessage: z.string().nullable(),
        refreshInterval: z.number().nullable(),
      }),
      hasChildren: true,
      description: "Fetches data from an API endpoint and displays children. Data auto-refreshes.",
    },

    PetCard: {
      props: z.object({
        name: z.string(),
        species: z.string(),
        breed: z.string().nullable(),
        age: z.number().nullable(),
        price: z.number(),
        status: z.string(),
        description: z.string().nullable(),
      }),
      description: "Displays a single pet with name, species, breed, age, price, and status.",
    },

    PetList: {
      props: z.object({
        status: z.enum(["available", "pending", "adopted"]).nullable(),
        species: z.enum(["dog", "cat", "bird", "fish", "rabbit"]).nullable(),
        refreshInterval: z.number().nullable(),
        fields: z
          .array(z.enum(["name", "species", "breed", "age", "price", "status", "description"]))
          .nullable(),
        layout: z.enum(["cards", "list", "compact"]).nullable(),
      }),
      description:
        "Fetches and displays a list of pets from /api/pets. Use 'fields' to control which data is shown and 'layout' to choose display style.",
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

DYNAMIC DATA COMPONENTS (for live data from APIs):
PetList: Fetches and displays pets from /api/pets. Props:
  - status: (available|pending|adopted) - filter by status
  - species: (dog|cat|bird|fish|rabbit) - filter by species
  - fields: array of fields to show: ["name", "price"] or ["name", "species", "price", "status"]
  - layout: "cards" (full cards), "list" (compact rows), "compact" (minimal rows)
  - refreshInterval: (ms) - auto-refresh interval, default 5000ms

  Examples:
  - Show only name and price: {"type":"PetList","props":{"fields":["name","price"],"layout":"compact"},"children":[]}
  - Show all available pets: {"type":"PetList","props":{"status":"available"},"children":[]}
  - Show dogs with name, breed, price: {"type":"PetList","props":{"species":"dog","fields":["name","breed","price"],"layout":"list"},"children":[]}

PetCard: Displays a single pet. Props: name, species, breed, age, price (cents), status, description.
DataList: Generic data fetcher. Props: endpoint (API URL), dataKey (key in response), emptyMessage, refreshInterval.

IMPORTANT: When creating components that need LIVE data from APIs (like pets, products, etc.), use PetList or DataList.
These components fetch data dynamically and auto-refresh, so new data will appear automatically.
Use the 'fields' prop to customize which data is displayed - this is key for creating focused views.
`;
