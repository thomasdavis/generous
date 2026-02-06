import { openai } from "@ai-sdk/openai";
import { registrySearchTool } from "@tpmjs/registry-search";
import { convertToModelMessages, generateText, stepCountIs, streamText, tool } from "ai";
import { z } from "zod";
import { parseJSONLToTree } from "@/lib/parse-jsonl";
import { componentList } from "@/lib/tool-catalog";

export const maxDuration = 60;

// System prompt for generating UI components
const UI_GENERATION_PROMPT = `You are a UI generator that outputs JSONL patches for building user interfaces.

Available components:
${componentList}

Output JSONL patches in this format:
{"op":"set","path":"/root","value":"<root-element-key>"}
{"op":"add","path":"/elements/<key>","value":{"type":"<ComponentName>","props":{...},"children":[...]}}

For INTERACTIVE components (InteractiveCard, Button, Input, Select), also set initial data:
{"op":"set","path":"/data","value":{"card1Color":"blue","formField1":"","formField2":""}}

## AVAILABLE ACTIONS

Actions are triggered by Button or InteractiveCard components via the "action" prop:

1. **set** - Set a data value
   {"name":"set","params":{"path":"/someField","value":"newValue"}}

2. **toggle** - Toggle a boolean
   {"name":"toggle","params":{"path":"/isEnabled"}}

3. **toggleColor** - Cycle through colors (blue, green, red, purple, orange, yellow, pink, teal)
   {"name":"toggleColor","params":{"path":"/cardColor"}}

4. **increment** - Increment a number
   {"name":"increment","params":{"path":"/counter","by":1}}

5. **apiCall** - Make an HTTP request to the API (IMPORTANT for forms!)
   {"name":"apiCall","params":{
     "endpoint":"/api/inventory",
     "method":"POST",
     "bodyPaths":{"itemName":"/form/itemName","itemType":"/form/itemType","unitPrice":"/form/unitPrice"},
     "revalidate":["/api/inventory"],
     "successMessage":"Item added successfully!",
     "resetPaths":["/form/itemName","/form/itemType","/form/unitPrice"]
   }}

## FORM EXAMPLE (Add Inventory Item)

{"op":"set","path":"/data","value":{"form":{"itemName":"","itemType":"food","unitPrice":"","quantity":""}}}
{"op":"set","path":"/root","value":"card1"}
{"op":"add","path":"/elements/card1","value":{"type":"Card","props":{"title":"Add Inventory Item","padding":"md"},"children":["stack1"]}}
{"op":"add","path":"/elements/stack1","value":{"type":"Stack","props":{"direction":"vertical","gap":"md"},"children":["input1","select1","input2","input3","btn1"]}}
{"op":"add","path":"/elements/input1","value":{"type":"Input","props":{"label":"Item Name","placeholder":"Enter item name","valuePath":"/form/itemName"},"children":[]}}
{"op":"add","path":"/elements/select1","value":{"type":"Select","props":{"label":"Item Type","valuePath":"/form/itemType","options":[{"value":"food","label":"Food"},{"value":"supplies","label":"Supplies"},{"value":"medicine","label":"Medicine"},{"value":"accessories","label":"Accessories"}]},"children":[]}}
{"op":"add","path":"/elements/input2","value":{"type":"Input","props":{"label":"Unit Price (cents)","placeholder":"e.g. 1999 for $19.99","valuePath":"/form/unitPrice","type":"number"},"children":[]}}
{"op":"add","path":"/elements/input3","value":{"type":"Input","props":{"label":"Quantity","placeholder":"Initial stock","valuePath":"/form/quantity","type":"number"},"children":[]}}
{"op":"add","path":"/elements/btn1","value":{"type":"Button","props":{"label":"Add Item","variant":"primary","action":{"name":"apiCall","params":{"endpoint":"/api/inventory","method":"POST","bodyPaths":{"itemName":"/form/itemName","itemType":"/form/itemType","unitPrice":"/form/unitPrice","quantity":"/form/quantity"},"revalidate":["/api/inventory"],"successMessage":"Inventory item added!","resetPaths":["/form/itemName","/form/unitPrice","/form/quantity"]}}},"children":[]}}

## API ENDPOINTS FOR FORMS

When creating forms, use these endpoints with apiCall:
- POST /api/pets - Add pet: {name, species, breed, age, price, description}
- POST /api/customers - Add customer: {firstName, lastName, email, phone, address, city, state, zipCode}
- POST /api/orders - Create order: {customerId, petId, quantity, notes}
- POST /api/inventory - Add inventory: {itemName, itemType, unitPrice, species, quantity, reorderLevel, supplier}
- PATCH /api/pets/:id - Update pet
- PATCH /api/orders/:id - Update order status

Rules:
- First line should set /data if using interactive components or forms
- Initialize form fields in data (e.g., {"form":{"field1":"","field2":""}})
- Then set /root
- Each element needs a unique key
- Children are arrays of element keys (strings)
- Props must match the component schema exactly
- Keep it simple and visually appealing
- Use realistic placeholder data that makes sense for the component type
- For forms that submit data to the API, ALWAYS use the apiCall action with proper bodyPaths`;

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

const createApiTools = (baseUrl: string) => ({
  // ===== PETS =====
  getPets: tool({
    description: "Get a list of pets from the pet store. Can filter by status or species.",
    inputSchema: z.object({
      status: z.enum(["available", "pending", "adopted"]).optional().describe("Filter by status"),
      species: z
        .string()
        .optional()
        .describe("Filter by species (dog, cat, bird, fish, rabbit, etc.)"),
    }),
    execute: async ({ status, species }) => {
      const params = new URLSearchParams();
      if (status) params.set("status", status);
      if (species) params.set("species", species);
      const url = `${baseUrl}/api/pets${params.toString() ? `?${params}` : ""}`;
      const response = await fetch(url);
      return response.json();
    },
  }),

  getPetById: tool({
    description: "Get a specific pet by its ID",
    inputSchema: z.object({
      id: z.string().describe("The pet ID"),
    }),
    execute: async ({ id }) => {
      const response = await fetch(`${baseUrl}/api/pets/${id}`);
      return response.json();
    },
  }),

  addPet: tool({
    description: "Add a new pet to the store",
    inputSchema: z.object({
      name: z.string().describe("Name of the pet"),
      species: z.string().describe("Species (dog, cat, bird, fish, rabbit, etc.)"),
      breed: z.string().optional().describe("Breed of the pet"),
      age: z.number().optional().describe("Age in years"),
      price: z.number().describe("Price in cents (e.g., 50000 = $500.00)"),
      description: z.string().optional().describe("Description of the pet"),
    }),
    execute: async ({ name, species, breed, age, price, description }) => {
      const response = await fetch(`${baseUrl}/api/pets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, species, breed, age, price, description }),
      });
      return response.json();
    },
  }),

  updatePet: tool({
    description: "Update a pet's information",
    inputSchema: z.object({
      id: z.string().describe("The pet ID"),
      name: z.string().optional().describe("New name"),
      status: z.enum(["available", "pending", "adopted"]).optional().describe("New status"),
      price: z.number().optional().describe("New price in cents"),
    }),
    execute: async ({ id, ...updates }) => {
      const response = await fetch(`${baseUrl}/api/pets/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      return response.json();
    },
  }),

  searchPets: tool({
    description: "Search pets by name or description",
    inputSchema: z.object({
      query: z.string().describe("Search query"),
    }),
    execute: async ({ query }) => {
      const response = await fetch(`${baseUrl}/api/pets/search?q=${encodeURIComponent(query)}`);
      return response.json();
    },
  }),

  getPetStats: tool({
    description:
      "Get statistics about pets in the store (counts by status, species, average price)",
    inputSchema: z.object({}),
    execute: async () => {
      const response = await fetch(`${baseUrl}/api/pets/stats`);
      return response.json();
    },
  }),

  // ===== CUSTOMERS =====
  getCustomers: tool({
    description: "Get a list of customers with optional search and pagination",
    inputSchema: z.object({
      search: z.string().optional().describe("Search by email"),
      limit: z.number().optional().describe("Results per page (default: 50)"),
      offset: z.number().optional().describe("Pagination offset"),
    }),
    execute: async ({ search, limit, offset }) => {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (limit) params.set("limit", String(limit));
      if (offset) params.set("offset", String(offset));
      const url = `${baseUrl}/api/customers${params.toString() ? `?${params}` : ""}`;
      const response = await fetch(url);
      return response.json();
    },
  }),

  getCustomerById: tool({
    description: "Get a specific customer by ID",
    inputSchema: z.object({
      id: z.string().describe("The customer ID"),
    }),
    execute: async ({ id }) => {
      const response = await fetch(`${baseUrl}/api/customers/${id}`);
      return response.json();
    },
  }),

  addCustomer: tool({
    description: "Add a new customer",
    inputSchema: z.object({
      firstName: z.string().describe("First name"),
      lastName: z.string().describe("Last name"),
      email: z.string().describe("Email address"),
      phone: z.string().optional().describe("Phone number"),
      address: z.string().optional().describe("Street address"),
      city: z.string().optional().describe("City"),
      state: z.string().optional().describe("State"),
      zipCode: z.string().optional().describe("ZIP code"),
    }),
    execute: async (data) => {
      const response = await fetch(`${baseUrl}/api/customers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return response.json();
    },
  }),

  // ===== ORDERS =====
  getOrders: tool({
    description: "Get a list of orders with optional filtering",
    inputSchema: z.object({
      status: z
        .enum(["placed", "approved", "delivered", "cancelled"])
        .optional()
        .describe("Filter by status"),
      customerId: z.string().optional().describe("Filter by customer ID"),
      limit: z.number().optional().describe("Results per page"),
      offset: z.number().optional().describe("Pagination offset"),
    }),
    execute: async ({ status, customerId, limit, offset }) => {
      const params = new URLSearchParams();
      if (status) params.set("status", status);
      if (customerId) params.set("customerId", customerId);
      if (limit) params.set("limit", String(limit));
      if (offset) params.set("offset", String(offset));
      const url = `${baseUrl}/api/orders${params.toString() ? `?${params}` : ""}`;
      const response = await fetch(url);
      return response.json();
    },
  }),

  getOrderById: tool({
    description: "Get order details including customer and pet info",
    inputSchema: z.object({
      id: z.string().describe("The order ID"),
    }),
    execute: async ({ id }) => {
      const response = await fetch(`${baseUrl}/api/orders/${id}`);
      return response.json();
    },
  }),

  createOrder: tool({
    description: "Create a new order (adopting a pet). This marks the pet as pending.",
    inputSchema: z.object({
      customerId: z.string().describe("Customer ID"),
      petId: z.string().describe("Pet ID"),
      quantity: z.number().optional().describe("Quantity (default: 1)"),
      notes: z.string().optional().describe("Order notes"),
    }),
    execute: async (data) => {
      const response = await fetch(`${baseUrl}/api/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return response.json();
    },
  }),

  updateOrderStatus: tool({
    description: "Update an order's status",
    inputSchema: z.object({
      id: z.string().describe("Order ID"),
      status: z.enum(["placed", "approved", "delivered", "cancelled"]).describe("New status"),
    }),
    execute: async ({ id, status }) => {
      const response = await fetch(`${baseUrl}/api/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      return response.json();
    },
  }),

  // ===== INVENTORY =====
  getInventory: tool({
    description: "Get inventory items (food, supplies, medicine, accessories)",
    inputSchema: z.object({
      type: z
        .string()
        .optional()
        .describe("Filter by type (food, supplies, medicine, accessories)"),
      species: z.string().optional().describe("Filter by target species"),
      lowStock: z.boolean().optional().describe("Show only low stock items"),
    }),
    execute: async ({ type, species, lowStock }) => {
      const params = new URLSearchParams();
      if (type) params.set("type", type);
      if (species) params.set("species", species);
      if (lowStock) params.set("lowStock", "true");
      const url = `${baseUrl}/api/inventory${params.toString() ? `?${params}` : ""}`;
      const response = await fetch(url);
      return response.json();
    },
  }),

  addInventoryItem: tool({
    description: "Add a new inventory item",
    inputSchema: z.object({
      itemName: z.string().describe("Item name"),
      itemType: z.enum(["food", "supplies", "medicine", "accessories"]).describe("Item type"),
      unitPrice: z.number().describe("Price per unit in cents"),
      species: z.string().optional().describe("Target species"),
      quantity: z.number().optional().describe("Initial quantity"),
      reorderLevel: z.number().optional().describe("Low stock threshold"),
      supplier: z.string().optional().describe("Supplier name"),
    }),
    execute: async (data) => {
      const response = await fetch(`${baseUrl}/api/inventory`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return response.json();
    },
  }),

  updateInventory: tool({
    description: "Update inventory item (e.g., adjust quantity)",
    inputSchema: z.object({
      id: z.string().describe("Inventory item ID"),
      quantity: z.number().optional().describe("New quantity"),
      unitPrice: z.number().optional().describe("New price"),
    }),
    execute: async ({ id, ...updates }) => {
      const response = await fetch(`${baseUrl}/api/inventory/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      return response.json();
    },
  }),

  // ===== STORE =====
  getStoreInfo: tool({
    description:
      "Get store information and dashboard statistics (total pets, orders, revenue, etc.)",
    inputSchema: z.object({}),
    execute: async () => {
      const response = await fetch(`${baseUrl}/api/store`);
      return response.json();
    },
  }),

  // ===== CATEGORIES =====
  getCategories: tool({
    description: "Get all pet categories",
    inputSchema: z.object({}),
    execute: async () => {
      const response = await fetch(`${baseUrl}/api/categories`);
      return response.json();
    },
  }),

  // ===== SEED =====
  seedDatabase: tool({
    description: "Seed the database with sample data (pets, customers, orders, inventory)",
    inputSchema: z.object({}),
    execute: async () => {
      const response = await fetch(`${baseUrl}/api/seed`, { method: "POST" });
      return response.json();
    },
  }),
});

// parseJSONLToTree imported from @/lib/parse-jsonl

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
      .describe(
        "Any specific data or context to include. IMPORTANT: If using a RegistryFetcher, you MUST include: (1) the exact full toolId (e.g., 'firecrawl-aisdk::searchTool'), (2) the params, and (3) the actual top-level response keys from registryExecute so the dataKey is set correctly (e.g., 'toolId=firecrawl-aisdk::searchTool, params={query:\"AI news\"}, responseFormat={web: [{url, title, description}]}, dataKey=web'). Never abbreviate package names. The dataKey MUST match a real key from the response.",
      ),
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

// Create TPMJS tools with env vars forwarding
const createTpmjsTools = (envVars: Record<string, string>) => {
  // Create a wrapped execute tool that auto-injects env vars
  const wrappedExecuteTool = tool({
    description:
      "Execute a tool from the TPMJS registry in a secure sandbox. Use registrySearch first to find the toolId. API keys from Settings are automatically included.",
    inputSchema: z.object({
      toolId: z
        .string()
        .describe("Tool identifier from search results (format: @package/name::toolName)"),
      params: z
        .record(z.string(), z.unknown())
        .describe("Tool-specific parameters as required by the tool"),
    }),
    execute: async ({ toolId, params }) => {
      // Parse toolId into packageName and name
      // Format: @scope/package::toolName or package::toolName
      const parts = toolId.split("::");
      if (parts.length !== 2) {
        return {
          error: true,
          message: `Invalid toolId format: ${toolId}. Expected format: @package/name::toolName`,
          toolId,
        };
      }

      const packageName = parts[0];
      const name = parts[1];

      // Call the executor service directly with env vars
      const executorUrl = process.env.TPMJS_EXECUTOR_URL || "https://executor.tpmjs.com";

      try {
        const response = await fetch(`${executorUrl}/execute-tool`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            packageName,
            name,
            version: "latest",
            importUrl: `https://esm.sh/${packageName}`,
            params,
            env: envVars,
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          return {
            error: true,
            message: `Execution failed: ${response.status} ${errorText}`,
            toolId,
          };
        }

        const result = await response.json();

        if (!result.success) {
          return {
            error: true,
            message: result.error || "Tool execution failed",
            toolId,
          };
        }

        return result.output;
      } catch (error) {
        return {
          error: true,
          message: error instanceof Error ? error.message : "Unknown execution error",
          toolId,
        };
      }
    },
  });

  return {
    registrySearch: registrySearchTool,
    registryExecute: wrappedExecuteTool,
  };
};

const baseTools = {
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
  const envVars = (body.envVars ?? {}) as Record<string, string>;

  if (!messages.length) {
    return new Response("No messages provided", { status: 400 });
  }

  // Get base URL from request headers
  const host = req.headers.get("host") || "localhost:3000";
  const protocol = req.headers.get("x-forwarded-proto") || "http";
  const baseUrl = `${protocol}://${host}`;

  // Create tools with the correct base URL and env vars
  const apiTools = createApiTools(baseUrl);
  const tpmjsTools = createTpmjsTools(envVars);
  const tools = { ...baseTools, ...apiTools, ...tpmjsTools };

  const modelMessages = await convertToModelMessages(messages, { tools });

  const result = streamText({
    model: openai("gpt-4.1-mini"),
    stopWhen: stepCountIs(200),
    system: `You are an intelligent assistant with access to the TPMJS Tool Registry - a powerful ecosystem of thousands of tools you can discover and execute dynamically. You can help users accomplish virtually any task by finding and using the right tools.

## CORE PHILOSOPHY
1. **Discovery First**: When a user asks for something, search the TPMJS registry to find the best tool
2. **Dynamic Over Static**: When creating dashboard widgets, ALWAYS configure them to fetch live data on page refresh
3. **API Keys Auto-Forward**: User's API keys from Settings are automatically included - never ask users to pass them manually

## TPMJS TOOL REGISTRY

### registrySearch - Discover Tools
Search thousands of tools using natural language.

\`\`\`
registrySearch({ query: "web scraping", limit: 5 })
→ Returns tools with: toolId, description, requiredEnvVars, healthStatus, qualityScore
\`\`\`

### registryExecute - Run Tools
Execute any discovered tool in a secure sandbox.

\`\`\`
registryExecute({
  toolId: "@firecrawl/ai-sdk::scrapeTool",
  params: { url: "https://example.com" }
})
\`\`\`

### WORKFLOW
1. **Search**: \`registrySearch\` with relevant keywords
2. **Check**: Note \`requiredEnvVars\` - if needed, tell user to add them in Settings (/settings)
3. **Execute**: \`registryExecute\` with toolId and params
4. **Create Widget** (if requested): Use \`createComponent\` with RegistryFetcher for live data

## CREATING DASHBOARD WIDGETS (CRITICAL)

When users ask to "create", "build", "add", or "make" a widget/component/dashboard item:

### ALWAYS USE DYNAMIC DATA
Components should fetch fresh data on every page load. Use the **RegistryFetcher** component which:
- Calls the TPMJS registry tool on mount and page refresh
- Auto-refreshes at configurable intervals
- Shows loading states automatically

### RegistryFetcher Component
\`\`\`json
{
  "type": "RegistryFetcher",
  "props": {
    "toolId": "@package/name::toolName",
    "params": { "key": "value" },
    "dataKey": "optionalKeyToExtract",
    "refreshInterval": 30000,
    "title": "Widget Title"
  }
}
\`\`\`

### WORKFLOW FOR WIDGET CREATION
1. \`registrySearch\` → find the right tool
2. \`registryExecute\` → verify it works, inspect the response structure
3. \`createComponent\` → In the dataContext, you MUST include:
   - The EXACT full toolId string (copy-paste from registryExecute, never abbreviate)
   - The actual top-level keys from the registryExecute response (e.g., if response was \`{web: [...]}\`, specify \`dataKey="web"\`)
   - The params used

### Example: "Create a widget showing Perplexity search results for AI news"
1. \`registrySearch({ query: "perplexity search" })\`
2. \`registryExecute({ toolId: "@perplexity-ai/ai-sdk::perplexitySearch", params: { query: "AI news" } })\`
   → Response: \`{ results: [{ title, url, content }] }\`
3. \`createComponent\` with dataContext:
   "toolId=@perplexity-ai/ai-sdk::perplexitySearch, params={query:'AI news'}, responseKeys={results}, dataKey='results'"

**CRITICAL**:
- The toolId in the RegistryFetcher MUST exactly match the toolId used in registryExecute. Never shorten or modify package names.
- The dataKey MUST match an actual top-level key from the registryExecute response. Inspect the response and use the correct key (e.g., "web" not "results" if the response has a "web" key).

### When Static Data Makes Sense
Only use static data for:
- One-time calculations (math, conversions)
- User-provided content (notes, text)
- Historical snapshots explicitly requested
- Data that genuinely never changes

## BUILT-IN UTILITY TOOLS
- **weather**: Current weather + forecast for any location
- **calculator**: Math calculations
- **stock**: Stock prices and market data
- **search**: Basic web search
- **timer**: Countdown timers
- **createComponent**: Create persistent dashboard widgets

## DEMO API (Pet Store)
A sample REST API is available for testing:
- \`getPets\`, \`addPet\`, \`updatePet\`, \`searchPets\`, \`getPetStats\`
- \`getCustomers\`, \`addCustomer\`
- \`getOrders\`, \`createOrder\`, \`updateOrderStatus\`
- \`getInventory\`, \`addInventoryItem\`
- \`getStoreInfo\`, \`getCategories\`, \`seedDatabase\`

Prices are in cents (50000 = $500.00).

## EXAMPLES

**"Search for something with Perplexity"**
→ registrySearch for perplexity → registryExecute with query

**"Create a dashboard showing my GitHub repos"**
→ registrySearch for github → registryExecute to test → createComponent with RegistryFetcher

**"Scrape a website"**
→ registrySearch for scraping → find firecrawl/browserbase → registryExecute

**"What tools are available for email?"**
→ registrySearch({ query: "email send" }) → present options to user

**"Build a weather widget for Tokyo"**
→ Use built-in weather tool OR registrySearch for weather APIs → createComponent with RegistryFetcher

## RESPONSE STYLE
- Be concise and action-oriented
- When tools require API keys, clearly state which keys are needed and direct users to /settings
- After executing tools, summarize the results helpfully
- When creating widgets, confirm they'll refresh automatically with live data`,
    messages: modelMessages,
    tools,
  });

  return result.toUIMessageStreamResponse();
}
