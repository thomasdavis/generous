# Generous: Universal Tool Composition Platform

## The Big Idea

Generous is a **meta-application** - an application shell that can manifest as *any* tool-based application through two key capabilities:

1. **TPMJS Registry** - Access to 100,000+ executable tools via natural language discovery
2. **JSON Component System** - A universal renderer that can compose any UI layout from a catalog of components

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         GENEROUS ARCHITECTURE                            │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   User: "Show me AI news from Perplexity, my GitHub repos,              │
│          and Hacker News - refresh every 5 minutes"                      │
│                           │                                              │
│                           ▼                                              │
│   ┌─────────────────────────────────────────────────────────────┐       │
│   │                    AI ORCHESTRATOR                           │       │
│   │  1. registrySearch("perplexity") → finds tool               │       │
│   │  2. registrySearch("github repos") → finds tool             │       │
│   │  3. registrySearch("hacker news") → finds tool              │       │
│   │  4. createComponent() → generates dashboard layout          │       │
│   └─────────────────────────────────────────────────────────────┘       │
│                           │                                              │
│           ┌───────────────┼───────────────┐                             │
│           ▼               ▼               ▼                             │
│   ┌─────────────┐ ┌─────────────┐ ┌─────────────┐                       │
│   │ @perplexity │ │ @github/    │ │ @hn-api/    │  ◄── TPMJS Registry   │
│   │ /ai-sdk     │ │ ai-sdk      │ │ tools       │      (100k+ tools)    │
│   └─────────────┘ └─────────────┘ └─────────────┘                       │
│           │               │               │                             │
│           └───────────────┼───────────────┘                             │
│                           ▼                                              │
│   ┌─────────────────────────────────────────────────────────────┐       │
│   │                   JSON COMPONENT SYSTEM                      │       │
│   │                                                              │       │
│   │  ┌─────────────────────────────────────────────────────┐    │       │
│   │  │ {"op":"set","path":"/root","value":"dashboard"}     │    │       │
│   │  │ {"op":"add","path":"/elements/dashboard","value":{  │    │       │
│   │  │   "type":"Grid","props":{"columns":3},"children":[  │    │       │
│   │  │     "perplexity","github","hn"                      │    │       │
│   │  │   ]                                                 │    │       │
│   │  │ }}                                                  │    │       │
│   │  │ {"op":"add","path":"/elements/perplexity","value":{ │    │       │
│   │  │   "type":"RegistryFetcher","props":{                │    │       │
│   │  │     "toolId":"@perplexity/ai-sdk::search",          │    │       │
│   │  │     "params":{"query":"AI news"},                   │    │       │
│   │  │     "refreshInterval":300000                        │    │       │
│   │  │   }                                                 │    │       │
│   │  │ }}                                                  │    │       │
│   │  │ ...                                                 │    │       │
│   │  └─────────────────────────────────────────────────────┘    │       │
│   │                           │                                  │       │
│   │                           ▼                                  │       │
│   │            47 Composable UI Components                       │       │
│   │   Card, Grid, Stack, Metric, Table, Chart, Form, Button...  │       │
│   └─────────────────────────────────────────────────────────────┘       │
│                           │                                              │
│                           ▼                                              │
│   ┌─────────────────────────────────────────────────────────────┐       │
│   │                    RENDERED DASHBOARD                        │       │
│   │  ┌──────────────┬──────────────┬──────────────┐             │       │
│   │  │ AI News      │ My Repos     │ Hacker News  │             │       │
│   │  │ (Perplexity) │ (GitHub)     │ (HN API)     │             │       │
│   │  │              │              │              │             │       │
│   │  │ • GPT-5...   │ • generous   │ • Show HN... │             │       │
│   │  │ • Claude...  │ • other-repo │ • Ask HN...  │             │       │
│   │  │              │              │              │             │       │
│   │  └──────────────┴──────────────┴──────────────┘             │       │
│   │                  ↻ Auto-refreshes every 5 min                │       │
│   └─────────────────────────────────────────────────────────────┘       │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

## Why This Matters

### Traditional App Development
```
Idea → Design → Code UI → Integrate APIs → Deploy → Maintain
         └──────────── weeks/months ────────────┘
```

### Generous Pattern
```
Idea → Chat with AI → Working Dashboard
         └─── minutes ───┘
```

The system separates three concerns that are usually coupled:

| Concern | Traditional | Generous |
|---------|-------------|----------|
| **Tool Logic** | Write code for each API | Discover from 100k+ registry |
| **UI Rendering** | Build custom components | Compose from 47 primitives |
| **Data Binding** | Wire up state management | Declarative path references |

---

## The Two Core Systems

### 1. TPMJS Tool Registry

**What it is:** A public registry of executable tools (think npm for AI tools).

**How it works in Generous:**

```typescript
// Step 1: Search - natural language tool discovery
const tools = await registrySearch({
  query: "scrape website and extract content",
  limit: 5
});
// Returns: [
//   { toolId: "@firecrawl/ai-sdk::scrape", description: "...", requiredEnvVars: ["FIRECRAWL_API_KEY"] },
//   { toolId: "@browserbase/ai-sdk::extract", description: "...", requiredEnvVars: [...] },
//   ...
// ]

// Step 2: Execute - run any tool in sandboxed environment
const result = await registryExecute({
  toolId: "@firecrawl/ai-sdk::scrape",
  params: { url: "https://example.com" }
});
// Tool runs on executor.tpmjs.com with user's API keys injected
```

**Key Properties:**
- **100,000+ tools** - Anything published as an AI SDK tool
- **Sandboxed execution** - Tools run remotely, not in your browser
- **API key injection** - User stores keys in Settings, system injects them
- **Zero code** - No npm install, no imports, just toolId + params

**Example Tools Available:**
- `@perplexity-ai/ai-sdk::search` - AI-powered search
- `@firecrawl/ai-sdk::scrape` - Web scraping
- `@github/ai-sdk::listRepos` - GitHub API
- `@stripe/ai-sdk::getBalance` - Payment data
- `@openai/ai-sdk::dalle` - Image generation
- `@browserbase/ai-sdk::screenshot` - Browser automation
- ... thousands more

### 2. JSON Component System

**What it is:** A declarative UI specification that maps to React components.

**The JSONL Format:**
```jsonl
{"op":"set","path":"/data","value":{"counter":0,"items":[]}}
{"op":"set","path":"/root","value":"app"}
{"op":"add","path":"/elements/app","value":{"type":"Card","props":{"title":"My App"},"children":["content"]}}
{"op":"add","path":"/elements/content","value":{"type":"Stack","props":{"gap":"md"},"children":["metric","button"]}}
{"op":"add","path":"/elements/metric","value":{"type":"Metric","props":{"label":"Count","value":"{{/counter}}"}}}
{"op":"add","path":"/elements/button","value":{"type":"Button","props":{"label":"Increment","action":{"name":"increment","params":{"path":"/counter"}}}}}
```

**Component Catalog (47 components):**

| Category | Components |
|----------|------------|
| **Layout** | Card, Grid, Stack, Divider |
| **Data Display** | Metric, Sparkline, ProgressBar, Badge, Table |
| **Forms** | Input, Select, Textarea, Checkbox, RadioGroup, Button |
| **Interactive** | InteractiveCard (color-changing), Toggle |
| **Domain-Specific** | PetList, CustomerList, OrderList, InventoryList |
| **Live Data** | DataList, **RegistryFetcher** |
| **Content** | Heading, Text, SearchResult, WeatherIcon, Timer |

**The Magic Component: `RegistryFetcher`**

This is the bridge between the tool registry and the UI:

```jsonl
{"op":"add","path":"/elements/news","value":{
  "type":"RegistryFetcher",
  "props":{
    "toolId":"@perplexity-ai/ai-sdk::search",
    "params":{"query":"latest AI research"},
    "refreshInterval":60000,
    "title":"AI Research News"
  }
}}
```

**What RegistryFetcher does:**
1. On mount: calls `/api/registry-execute` with toolId + params
2. Injects user's API keys from localStorage
3. Renders result (arrays as cards, objects as JSON)
4. Auto-refreshes at specified interval
5. Shows loading/error states automatically

---

## How They Compose Together

### Example: "Build me a developer dashboard"

**User prompt:**
> "Create a dashboard showing my GitHub notifications, recent commits, and CI/CD status from my repos"

**AI's actions:**

```
1. registrySearch("github notifications")
   → finds @github/ai-sdk::getNotifications

2. registrySearch("github commits")
   → finds @github/ai-sdk::listCommits

3. registrySearch("github actions status")
   → finds @github/ai-sdk::getWorkflowRuns

4. createComponent() with description:
   "3-column grid with RegistryFetchers for each GitHub tool"
```

**Generated JSONL:**
```jsonl
{"op":"set","path":"/root","value":"dashboard"}
{"op":"add","path":"/elements/dashboard","value":{"type":"Card","props":{"title":"Developer Dashboard"},"children":["grid"]}}
{"op":"add","path":"/elements/grid","value":{"type":"Grid","props":{"columns":3,"gap":"md"},"children":["notifications","commits","actions"]}}
{"op":"add","path":"/elements/notifications","value":{"type":"RegistryFetcher","props":{"toolId":"@github/ai-sdk::getNotifications","params":{},"refreshInterval":30000,"title":"Notifications"}}}
{"op":"add","path":"/elements/commits","value":{"type":"RegistryFetcher","props":{"toolId":"@github/ai-sdk::listCommits","params":{"repo":"generous"},"refreshInterval":60000,"title":"Recent Commits"}}}
{"op":"add","path":"/elements/actions","value":{"type":"RegistryFetcher","props":{"toolId":"@github/ai-sdk::getWorkflowRuns","params":{"repo":"generous"},"refreshInterval":30000,"title":"CI/CD Status"}}}
```

**Result:** A live-updating dashboard that:
- Pulls from 3 different GitHub API endpoints
- Refreshes automatically
- Required zero code to create
- Can be dragged/resized on the grid
- Persists in browser storage

---

## The Power of Composition

### Any Tool + Any Layout = Any App

```
┌─────────────────────────────────────────────────────────────┐
│                     TOOL REGISTRY                            │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐           │
│  │ Search  │ │ Scrape  │ │ AI/ML   │ │ Payment │  × 100k+  │
│  │ APIs    │ │ Tools   │ │ Models  │ │ APIs    │           │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘           │
└─────────────────────────────────────────────────────────────┘
                            ×
┌─────────────────────────────────────────────────────────────┐
│                    COMPONENT CATALOG                         │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐           │
│  │ Cards   │ │ Grids   │ │ Forms   │ │ Charts  │  × 47     │
│  │ Tables  │ │ Stacks  │ │ Inputs  │ │ Metrics │           │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘           │
└─────────────────────────────────────────────────────────────┘
                            =
┌─────────────────────────────────────────────────────────────┐
│                    INFINITE APPLICATIONS                     │
│                                                              │
│  • Sales dashboard (Stripe + HubSpot + Slack)               │
│  • Research assistant (Perplexity + Arxiv + Notion)         │
│  • Social media manager (Twitter + LinkedIn + Buffer)       │
│  • DevOps console (GitHub + AWS + Datadog)                  │
│  • Personal finance (Plaid + Mint + Spreadsheets)           │
│  • Content aggregator (RSS + Reddit + HN + YouTube)         │
│  • ... anything you can describe                            │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Technical Deep Dive

### The RegistryFetcher Component

```typescript
// apps/generous/src/components/tool-registry.tsx:1487-1564

export function RegistryFetcher({ element }: ComponentRenderProps) {
  const { toolId, params, dataKey, refreshInterval, title } = element.props;

  // Stable cache key for SWR
  const cacheKey = `registry:${toolId}:${JSON.stringify(params || {})}`;

  const registryFetcher = async () => {
    // Get user's API keys from localStorage
    const envVars = getEnvVarsFromStorage();

    // Call the execution proxy
    const response = await fetch("/api/registry-execute", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-generous-env-vars": JSON.stringify(envVars),
      },
      body: JSON.stringify({ toolId, params: params || {} }),
    });
    return response.json();
  };

  // SWR handles caching, deduplication, and auto-refresh
  const { data, error, isLoading } = useSWR(cacheKey, registryFetcher, {
    refreshInterval: refreshInterval || 10000,
    revalidateOnFocus: true,
  });

  // Render loading, error, or data states
  // Arrays render as card lists, objects as formatted JSON
}
```

### The Registry Execute Proxy

```typescript
// apps/generous/src/app/api/registry-execute/route.ts

export async function POST(req: NextRequest) {
  const { toolId, params } = await req.json();

  // Parse toolId: "@scope/package::toolName"
  const [packageName, name] = toolId.split("::");

  // Get user's env vars from header
  const envVars = JSON.parse(req.headers.get("x-generous-env-vars") || "{}");

  // Forward to TPMJS executor service
  const response = await fetch(`${EXECUTOR_URL}/execute-tool`, {
    method: "POST",
    body: JSON.stringify({
      packageName,
      name,
      version: "latest",
      importUrl: `https://esm.sh/${packageName}`,
      params,
      env: envVars,  // API keys injected here
    }),
  });

  return NextResponse.json(await response.json());
}
```

### How Tools Get Into the Registry

Tools are npm packages that export AI SDK tool definitions:

```typescript
// Example: @weather/ai-sdk package
import { tool } from "ai";
import { z } from "zod";

export const getWeather = tool({
  description: "Get current weather for a location",
  inputSchema: z.object({
    location: z.string(),
    units: z.enum(["celsius", "fahrenheit"]).optional(),
  }),
  execute: async ({ location, units }) => {
    // Call weather API
    const data = await fetch(`https://api.weather.com/...`);
    return data.json();
  },
});
```

Once published to npm and registered with TPMJS, it becomes:
- Discoverable via `registrySearch({ query: "weather" })`
- Executable via `registryExecute({ toolId: "@weather/ai-sdk::getWeather", params: {...} })`
- Renderable via `RegistryFetcher` component

---

## The Data Flow

```
┌──────────────────────────────────────────────────────────────────┐
│                          USER INTERACTION                         │
│                                                                   │
│  "Build a crypto dashboard with prices and news"                 │
└────────────────────────────────┬─────────────────────────────────┘
                                 │
                                 ▼
┌──────────────────────────────────────────────────────────────────┐
│                         AI ORCHESTRATOR                           │
│                        (apps/generous/src/app/api/chat)           │
│                                                                   │
│  Tools available:                                                 │
│  • registrySearch - find tools by description                    │
│  • registryExecute - run tools to verify they work               │
│  • createComponent - generate JSONL for persistent widget        │
│                                                                   │
│  AI thinks: "I need crypto prices and news tools..."             │
│  1. registrySearch("cryptocurrency prices") → @coingecko/...     │
│  2. registrySearch("crypto news") → @cryptonews/...              │
│  3. registryExecute both to verify they work                     │
│  4. createComponent with RegistryFetchers for each               │
└────────────────────────────────┬─────────────────────────────────┘
                                 │
                                 ▼
┌──────────────────────────────────────────────────────────────────┐
│                      COMPONENT GENERATION                         │
│                     (nested generateText call)                    │
│                                                                   │
│  System prompt includes:                                          │
│  • All 47 component schemas                                       │
│  • RegistryFetcher usage examples                                │
│  • JSONL format specification                                     │
│                                                                   │
│  Output: JSONL patches defining the widget                       │
└────────────────────────────────┬─────────────────────────────────┘
                                 │
                                 ▼
┌──────────────────────────────────────────────────────────────────┐
│                      CLIENT-SIDE STORAGE                          │
│                        (IndexedDB via idb)                        │
│                                                                   │
│  Stores:                                                          │
│  • components: { id, name, jsonl, tree }                         │
│  • gridLayout: { i, x, y, w, h }                                 │
│  • chatHistory: { messages }                                      │
└────────────────────────────────┬─────────────────────────────────┘
                                 │
                                 ▼
┌──────────────────────────────────────────────────────────────────┐
│                       RUNTIME RENDERING                           │
│                       (@json-render/react)                        │
│                                                                   │
│  For each RegistryFetcher in the tree:                           │
│  1. Mount → fetch from /api/registry-execute                     │
│  2. Inject user's API keys                                        │
│  3. Forward to executor.tpmjs.com                                 │
│  4. Render response (auto-refresh at interval)                   │
└──────────────────────────────────────────────────────────────────┘
```

---

## What This Enables

### 1. Zero-Code Application Building
Users describe what they want; AI finds tools and composes UI.

### 2. Instant Integration
No API documentation reading, no SDKs to learn, no code to write.

### 3. Living Dashboards
Widgets auto-refresh and can be rearranged, merged, or deleted.

### 4. Portable State
Everything stored client-side; export/import entire dashboards.

### 5. Extensibility Without Deployment
New tools appear in registry → immediately available to all users.

---

## Limitations & Trade-offs

| Trade-off | Implication |
|-----------|-------------|
| **External Dependency** | Relies on executor.tpmjs.com being available |
| **Tool Quality Varies** | Registry tools have different quality/reliability |
| **Limited UI Customization** | Constrained to 47 component types |
| **API Key Management** | Users must provide their own keys |
| **No Custom Logic** | Can't write arbitrary code in widgets |

---

## Future Possibilities

1. **Tool Chaining** - Output of one tool as input to another
2. **Conditional Rendering** - Show/hide based on data values
3. **Custom Component Registration** - Add your own component types
4. **Collaborative Dashboards** - Share and fork dashboard configs
5. **Tool Recommendations** - AI suggests tools based on context
6. **Offline Mode** - Cache tool results for offline viewing

---

## The Philosophy

Generous embodies a bet on the future:

> **The next generation of applications won't be coded—they'll be composed from a universe of pre-built capabilities, assembled by AI, and rendered through universal component systems.**

This is the vision: a world where "building an app" means describing what you want, and the system finds the tools and arranges the UI.

The tool registry is the capability layer.
The component system is the presentation layer.
The AI is the assembly layer.

Together, they create a new kind of application platform.
