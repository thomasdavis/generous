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

    // Form Inputs
    Input: {
      props: z.object({
        label: z.string().nullable(),
        placeholder: z.string().nullable(),
        valuePath: z.string(),
        type: z.enum(["text", "email", "number", "password", "tel", "url"]).nullable(),
        disabled: z.boolean().nullable(),
      }),
      description:
        "Text input field bound to a data path. Changes update the data at valuePath via set action.",
    },

    Select: {
      props: z.object({
        label: z.string().nullable(),
        valuePath: z.string(),
        options: z.array(
          z.object({
            value: z.string(),
            label: z.string(),
          }),
        ),
        placeholder: z.string().nullable(),
        disabled: z.boolean().nullable(),
      }),
      description: "Dropdown select bound to a data path. Options array defines choices.",
    },

    Textarea: {
      props: z.object({
        label: z.string().nullable(),
        placeholder: z.string().nullable(),
        valuePath: z.string(),
        rows: z.number().nullable(),
        disabled: z.boolean().nullable(),
      }),
      description: "Multiline text input bound to a data path.",
    },

    Checkbox: {
      props: z.object({
        label: z.string(),
        checkedPath: z.string(),
        disabled: z.boolean().nullable(),
      }),
      description: "Checkbox bound to a boolean data path.",
    },

    RadioGroup: {
      props: z.object({
        label: z.string().nullable(),
        valuePath: z.string(),
        options: z.array(
          z.object({
            value: z.string(),
            label: z.string(),
          }),
        ),
        disabled: z.boolean().nullable(),
      }),
      description: "Radio button group bound to a data path. Only one option can be selected.",
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

    // Customer components
    CustomerList: {
      props: z.object({
        search: z.string().nullable(),
        limit: z.number().nullable(),
        refreshInterval: z.number().nullable(),
        fields: z
          .array(z.enum(["firstName", "lastName", "email", "phone", "city", "state"]))
          .nullable(),
        layout: z.enum(["cards", "list", "compact"]).nullable(),
      }),
      description: "Fetches and displays customers from /api/customers.",
    },

    CustomerCard: {
      props: z.object({
        firstName: z.string(),
        lastName: z.string(),
        email: z.string(),
        phone: z.string().nullable(),
        address: z.string().nullable(),
        city: z.string().nullable(),
        state: z.string().nullable(),
        zipCode: z.string().nullable(),
      }),
      description: "Displays a single customer.",
    },

    // Order components
    OrderList: {
      props: z.object({
        status: z.enum(["placed", "approved", "delivered", "cancelled"]).nullable(),
        customerId: z.string().nullable(),
        limit: z.number().nullable(),
        refreshInterval: z.number().nullable(),
        layout: z.enum(["cards", "list", "compact"]).nullable(),
      }),
      description: "Fetches and displays orders from /api/orders.",
    },

    OrderCard: {
      props: z.object({
        id: z.string(),
        status: z.string(),
        totalPrice: z.number(),
        quantity: z.number(),
        customerName: z.string().nullable(),
        petName: z.string().nullable(),
        createdAt: z.string().nullable(),
      }),
      description: "Displays a single order.",
    },

    // Inventory components
    InventoryList: {
      props: z.object({
        itemType: z.enum(["food", "toy", "accessory", "medicine"]).nullable(),
        species: z.enum(["dog", "cat", "bird", "fish", "rabbit"]).nullable(),
        lowStockOnly: z.boolean().nullable(),
        refreshInterval: z.number().nullable(),
        layout: z.enum(["cards", "list", "compact"]).nullable(),
      }),
      description: "Fetches and displays inventory from /api/inventory.",
    },

    InventoryCard: {
      props: z.object({
        itemName: z.string(),
        itemType: z.string(),
        species: z.string().nullable(),
        quantity: z.number(),
        unitPrice: z.number(),
        reorderLevel: z.number().nullable(),
      }),
      description: "Displays a single inventory item.",
    },

    // Store components
    StoreStats: {
      props: z.object({
        refreshInterval: z.number().nullable(),
      }),
      description: "Fetches and displays store statistics from /api/store.",
    },

    // Category components
    CategoryList: {
      props: z.object({
        refreshInterval: z.number().nullable(),
        layout: z.enum(["cards", "list", "compact"]).nullable(),
      }),
      description: "Fetches and displays pet categories from /api/categories.",
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

FORM INPUTS (for user data entry):
Input: Text input bound to data. Props: label, placeholder, valuePath, type (text|email|number|password|tel|url), disabled.
  - valuePath: data path to read/write value (e.g., "/formData/name")
  - Changes automatically update data via set action
Select: Dropdown select bound to data. Props: label, valuePath, options [{value, label}], placeholder, disabled.
  - options: array of {value: "val", label: "Display"} objects
Textarea: Multiline text input. Props: label, placeholder, valuePath, rows, disabled.
Checkbox: Checkbox bound to boolean. Props: label, checkedPath, disabled.
  - checkedPath: data path to boolean value (e.g., "/formData/agreed")
RadioGroup: Radio button group. Props: label, valuePath, options [{value, label}], disabled.
  - Only one option can be selected at a time

FORM DATA: For forms, include initial data in your tree:
  {"op":"set","path":"/data","value":{"formData":{"name":"","email":"","species":"dog","agreed":false}}}

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

CustomerList: Fetches and displays customers from /api/customers. Props:
  - search: search by email
  - limit: max customers to show
  - fields: ["firstName", "lastName", "email", "phone", "city", "state"]
  - layout: "cards" | "list" | "compact"
  - refreshInterval: (ms)

OrderList: Fetches and displays orders from /api/orders. Props:
  - status: (placed|approved|delivered|cancelled)
  - customerId: filter by customer
  - limit: max orders to show
  - layout: "cards" | "list" | "compact"
  - refreshInterval: (ms)

InventoryList: Fetches and displays inventory from /api/inventory. Props:
  - itemType: (food|toy|accessory|medicine)
  - species: (dog|cat|bird|fish|rabbit)
  - lowStockOnly: boolean - show only low stock items
  - layout: "cards" | "list" | "compact"
  - refreshInterval: (ms)

StoreStats: Fetches and displays store dashboard from /api/store. Props:
  - refreshInterval: (ms)
  Shows: total pets, available pets, pending orders, revenue, customers, low stock alerts.

CategoryList: Fetches and displays pet categories from /api/categories. Props:
  - layout: "cards" | "list" | "compact"
  - refreshInterval: (ms)

STATIC CARD COMPONENTS (for rendering individual items):
PetCard: Single pet. Props: name, species, breed, age, price (cents), status, description.
CustomerCard: Single customer. Props: firstName, lastName, email, phone, address, city, state, zipCode.
OrderCard: Single order. Props: id, status, totalPrice, quantity, customerName, petName, createdAt.
InventoryCard: Single inventory item. Props: itemName, itemType, species, quantity, unitPrice, reorderLevel.

API REFERENCE (all endpoints support GET for reading, POST for creating):
  /api/pets - List/create pets. Filters: status, species
  /api/pets/:id - Get/update/delete single pet
  /api/pets/search - Advanced search with q, minPrice, maxPrice, minAge, maxAge, breed
  /api/pets/stats - Get pet statistics
  /api/customers - List/create customers. Filters: search, limit, offset
  /api/customers/:id - Get/update/delete single customer
  /api/orders - List/create orders. Filters: status, customerId
  /api/orders/:id - Get/update/delete single order
  /api/inventory - List/create inventory. Filters: type, species, lowStock
  /api/inventory/:id - Get/update/delete inventory item
  /api/categories - List/create categories
  /api/categories/:id - Get/update/delete category
  /api/store - Get/update store info and stats
  /api/seed - POST to seed sample data, GET to check counts
  /api/user/me - Get current authenticated user

IMPORTANT: When creating components that need LIVE data from APIs, use the List components (PetList, CustomerList, etc.).
These components fetch data dynamically and auto-refresh, so new data will appear automatically.
Use the 'fields' prop to customize which data is displayed - this is key for creating focused views.
`;
