# Generous: Comprehensive Repository Analysis Report

## 1. Executive Summary

**Generous** is an AI-powered dynamic widget generation and dashboard platform. It enables users to describe UI components in natural language (e.g., "build me a weather widget for Tokyo"), and an AI assistant generates fully interactive widgets that appear on a drag-and-drop dashboard.

### What it is
A Next.js application that combines:
- **AI-powered UI generation** using Vercel AI SDK v6 and OpenAI
- **A constrained component catalog** that acts as a guardrail for AI outputs
- **JSONL patch-based streaming** for progressive UI rendering
- **Dynamic tool discovery** via TPMJS registry integration
- **Client-side persistence** using IndexedDB for dashboard state
- **A demo Pet Store API** with PostgreSQL for demonstrating data-driven widgets

### Who it's for
- **Developers** exploring AI-driven UI generation patterns
- **Product teams** wanting to prototype "chat-to-UI" experiences
- **Framework evaluators** examining modern patterns for AI SDK, json-render, and monorepo architectures

### Why it matters
Generous represents a novel pattern for **constrained AI UI generation**—the AI can only produce components from a predefined catalog, making outputs predictable and safe. This addresses a core challenge in AI UI generation: preventing arbitrary or broken HTML/CSS while still enabling creative flexibility.

---

## 2. Repo Atlas (Directory Map)

```
generous/
├── apps/
│   └── generous/                    # Main Next.js 15 application
│       ├── src/
│       │   ├── app/                 # Next.js App Router pages & API routes
│       │   │   ├── api/             # Backend API endpoints
│       │   │   │   ├── chat/        # Main AI chat endpoint (streaming)
│       │   │   │   ├── merge/       # AI-powered widget merging
│       │   │   │   ├── render-tool/ # AI tool result → UI transformation
│       │   │   │   ├── registry-execute/ # TPMJS tool execution proxy
│       │   │   │   ├── pets/        # Demo Pet Store CRUD
│       │   │   │   ├── customers/   # Demo Customer CRUD
│       │   │   │   ├── orders/      # Demo Order CRUD
│       │   │   │   ├── inventory/   # Demo Inventory CRUD
│       │   │   │   └── ...
│       │   │   ├── styleguide/      # Design system documentation site
│       │   │   ├── settings/        # API key management UI
│       │   │   └── page.tsx         # Main dashboard page
│       │   ├── components/          # React components
│       │   │   ├── Chat.tsx         # Chat interface with AI
│       │   │   ├── StoredComponentRenderer.tsx  # Renders saved widgets
│       │   │   ├── ToolResultRenderer.tsx       # Renders streamed tool results
│       │   │   └── tool-registry.tsx            # 47+ UI components for AI
│       │   ├── lib/
│       │   │   ├── app-state.tsx    # React context for dashboard state
│       │   │   ├── db.ts            # IndexedDB operations
│       │   │   ├── tool-catalog.ts  # Component catalog definition (Zod schemas)
│       │   │   └── auth*.ts         # Better Auth configuration
│       │   └── server/db/           # Drizzle ORM schema & connection
│       └── tests/                   # Vitest unit & Playwright e2e tests
│
├── packages/
│   ├── ui/                          # @generous/ui - 47-component design system
│   │   ├── src/
│   │   │   ├── components/          # Button, Dialog, Toast, etc.
│   │   │   ├── tokens/              # CSS design tokens
│   │   │   ├── styles/              # Base CSS & reset
│   │   │   └── hooks/               # useTheme, useMediaQuery
│   │   └── CLAUDE.md                # Design system documentation
│   ├── config-typescript/           # Shared TypeScript configurations
│   └── config-biome/                # Shared Biome (linter/formatter) config
│
├── .claude/                         # Claude Code configuration
├── .cursor/, .gemini/, .codex/      # Various AI tool configurations
├── turbo.json                       # Turborepo task definitions
├── pnpm-workspace.yaml              # Monorepo workspace definition
└── AI_SDK_AGENT_PATTERN.md          # Reference documentation for AI SDK v6
```

### Key Areas Explained

| Directory | Purpose |
|-----------|---------|
| `apps/generous/src/app/api/chat/` | The brain - AI orchestration with tools |
| `apps/generous/src/components/tool-registry.tsx` | 1600+ lines: every UI component the AI can render |
| `apps/generous/src/lib/tool-catalog.ts` | Zod schemas defining what AI can create |
| `apps/generous/src/lib/db.ts` | IndexedDB wrapper for browser persistence |
| `packages/ui/` | Foundation design system used by the app |

---

## 3. Quickstart

### Prerequisites
- Node.js 22+ (see `.nvmrc`)
- pnpm 9+
- PostgreSQL database (Neon recommended)

### Setup Commands

```bash
# 1. Install dependencies
pnpm install

# 2. Configure environment
cp apps/generous/.env.example apps/generous/.env
# Edit .env with:
#   DATABASE_URL=postgres://...
#   BETTER_AUTH_SECRET=<32+ char secret>
#   BETTER_AUTH_URL=http://localhost:3000

# 3. Initialize database
pnpm db:generate
pnpm db:push

# 4. Start development
pnpm dev
```

### Available Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start Next.js in Turbopack mode |
| `pnpm build` | Production build |
| `pnpm test` | Run Vitest unit tests |
| `pnpm test:e2e` | Run Playwright E2E tests |
| `pnpm lint` | Biome linting |
| `pnpm format` | Biome formatting |
| `pnpm db:studio` | Open Drizzle Studio |

---

## 4. Architecture Overview

### System Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                           BROWSER                                    │
├─────────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐    ┌──────────────────┐    ┌────────────────────┐ │
│  │    Chat      │───▶│  AppStateContext │───▶│ react-grid-layout  │ │
│  │ (useChat)    │    │  (React Context) │    │   (Dashboard)      │ │
│  └──────┬───────┘    └────────┬─────────┘    └────────────────────┘ │
│         │                     │                        │            │
│         ▼                     ▼                        ▼            │
│  ┌──────────────┐    ┌──────────────────┐    ┌────────────────────┐ │
│  │ AI SDK v6    │    │    IndexedDB     │    │ StoredComponent    │ │
│  │ (streaming)  │    │ (idb wrapper)    │    │ Renderer           │ │
│  └──────┬───────┘    └──────────────────┘    └─────────┬──────────┘ │
│         │                                              │            │
└─────────┼──────────────────────────────────────────────┼────────────┘
          │                                              │
          ▼                                              ▼
┌─────────────────────┐                    ┌────────────────────────┐
│    /api/chat        │                    │   @json-render/react   │
│  ┌───────────────┐  │                    │   ┌────────────────┐   │
│  │   streamText  │  │                    │   │    Renderer    │   │
│  │   + tools     │  │                    │   │  + DataProvider │  │
│  └───────────────┘  │                    │   │  + ActionProv.  │  │
│         │           │                    │   └────────────────┘   │
│         ▼           │                    └────────────────────────┘
│  ┌───────────────┐  │
│  │ createComponent│ │─────────▶ generateText() ───▶ JSONL patches
│  │ tool          │  │
│  └───────────────┘  │
└─────────────────────┘
          │
          ▼
┌─────────────────────┐    ┌─────────────────────┐
│   Demo REST APIs    │    │   TPMJS Registry    │
│  /api/pets          │    │   (External)        │
│  /api/customers     │    │  registrySearch     │
│  /api/orders        │    │  registryExecute    │
│  /api/inventory     │    └─────────────────────┘
└─────────────────────┘
          │
          ▼
┌─────────────────────┐
│   Neon PostgreSQL   │
│   (Drizzle ORM)     │
└─────────────────────┘
```

### Component Boundaries

1. **Client-Side State** (IndexedDB)
   - Chat history
   - Created widgets (JSONL + parsed tree)
   - Grid layout positions

2. **Server-Side State** (PostgreSQL)
   - Demo Pet Store data (pets, customers, orders, inventory)
   - Auth sessions & users (Better Auth)

3. **External Services**
   - OpenAI (gpt-4.1-mini for generation)
   - TPMJS executor (`executor.tpmjs.com`) for registry tools

---

## 5. End-to-End Flows

### Flow 1: Creating a Widget (Primary Happy Path)

```
User types: "Build me a weather widget for Tokyo"
     │
     ▼
Chat.tsx sends message to /api/chat via AI SDK transport
     │
     ▼
/api/chat/route.ts receives message, creates streamText() with tools
     │
     ▼
LLM decides to call `createComponent` tool
     │
     ├── Tool executes nested generateText() with UI_GENERATION_PROMPT
     │   └── Returns JSONL patches like:
     │       {"op":"set","path":"/data","value":{...}}
     │       {"op":"set","path":"/root","value":"card1"}
     │       {"op":"add","path":"/elements/card1","value":{...}}
     │
     ▼
Tool returns {_isComponent: true, success: true, name, jsonl, tree}
     │
     ▼
Chat.tsx's ToolPartHandler detects `_isComponent: true`
     │
     ▼
useAppState.addComponent() called:
     │
     ├── Saves to IndexedDB
     ├── Calculates optimal grid position
     └── Updates React state
     │
     ▼
Dashboard re-renders with new widget in GridLayout
     │
     ▼
StoredComponentRenderer renders the widget via @json-render/react
```

**Key Files:**
- `apps/generous/src/app/api/chat/route.ts:544-599` - createComponent tool
- `apps/generous/src/components/Chat.tsx:341-355` - handleComponentCreated
- `apps/generous/src/lib/app-state.tsx:189-312` - addComponent with intelligent placement

### Flow 2: Using Registry Tools

```
User: "Search for Perplexity tools"
     │
     ▼
LLM calls registrySearch tool
     │
     ├── Calls @tpmjs/registry-search directly
     └── Returns list of matching tools
     │
     ▼
User: "Use @perplexity-ai/ai-sdk::perplexitySearch for AI news"
     │
     ▼
LLM calls registryExecute tool
     │
     ├── /api/chat builds request with user's env vars from body
     ├── Calls https://executor.tpmjs.com/execute-tool
     │   with {packageName, name, params, env}
     └── Returns tool output
     │
     ▼
User: "Now create a widget that shows this"
     │
     ▼
LLM calls createComponent with RegistryFetcher description
     │
     ▼
Widget uses RegistryFetcher component that:
     ├── Reads env vars from localStorage
     ├── Calls /api/registry-execute on mount
     └── Auto-refreshes at specified interval
```

**Key Files:**
- `apps/generous/src/app/api/chat/route.ts:601-681` - createTpmjsTools
- `apps/generous/src/app/api/registry-execute/route.ts` - Proxy endpoint
- `apps/generous/src/components/tool-registry.tsx:1487-1564` - RegistryFetcher component

### Flow 3: Widget Merging (Drag & Drop)

```
User drags Widget A onto Widget B (>50% overlap)
     │
     ▼
page.tsx handleDragStop detects overlap via checkOverlap()
     │
     ▼
MergeModal opens with both components
     │
     ▼
User clicks "Merge"
     │
     ▼
POST /api/merge with {componentA, componentB}
     │
     ├── Calls generateText() with MERGE_PROMPT
     ├── LLM outputs merged JSONL
     └── Returns {name, jsonl, tree}
     │
     ▼
useAppState.mergeComponents():
     │
     ├── Deletes both original components from IndexedDB
     ├── Creates new merged component
     └── Updates grid layout
```

**Key Files:**
- `apps/generous/src/app/page.tsx:104-159` - handleDragStop and checkOverlap
- `apps/generous/src/app/api/merge/route.ts` - Merge endpoint

---

## 6. Subsystem Deep Dives

### 6.1 AI Chat System (`/api/chat`)

**Purpose:** Orchestrates AI conversations with tool access for UI generation.

**Inputs:**
- `messages`: Array of UIMessage objects (AI SDK v6 parts format)
- `envVars`: User-provided API keys from localStorage

**Key Abstractions:**

```typescript
// apps/generous/src/app/api/chat/route.ts

// 1. Built-in tools (weather, calculator, stock, etc.)
const baseTools = {
  weather: weatherTool,
  calculator: calculatorTool,
  stock: stockTool,
  search: searchTool,
  timer: timerTool,
  createComponent: createComponentTool,  // THE KEY TOOL
};

// 2. Dynamic API tools created per-request with base URL
const apiTools = createApiTools(baseUrl);  // getPets, addPet, etc.

// 3. TPMJS registry tools with env vars
const tpmjsTools = createTpmjsTools(envVars);

// Combined and passed to streamText
streamText({
  model: openai("gpt-4.1-mini"),
  stopWhen: stepCountIs(200),  // AI SDK v6 multi-step
  tools: { ...baseTools, ...apiTools, ...tpmjsTools },
});
```

**Control Flow:**
1. Parse request body for messages and envVars
2. Create tools with request context (base URL, env vars)
3. Convert messages to model format
4. Stream response with multi-step tool execution
5. Return as UI message stream

**Performance Notes:**
- `maxDuration = 60` seconds for Vercel serverless timeout
- Uses `gpt-4.1-mini` for cost/speed balance
- `stepCountIs(200)` allows extensive tool loops

### 6.2 Component Catalog (`tool-catalog.ts`)

**Purpose:** Defines ALL components the AI can generate as Zod schemas.

**Key Abstraction:**

```typescript
// apps/generous/src/lib/tool-catalog.ts

export const toolCatalog = createCatalog({
  name: "tool-ui",
  components: {
    Button: {
      props: z.object({
        label: z.string(),
        action: z.object({ name: z.string(), params: z.record(...) }).optional(),
        variant: z.enum(["primary", "secondary", "outline", "danger"]).nullable(),
      }),
      description: "Clickable button that triggers an action.",
    },
    // ... 40+ more components
  },
});
```

**Why This Exists:**
- **Guardrails:** AI can ONLY output components defined here
- **Type Safety:** Props validated at generation time
- **Documentation:** Descriptions guide LLM behavior
- **Consistency:** All widgets follow the same patterns

### 6.3 JSONL Patch System

**Purpose:** A streaming-friendly format for progressive UI construction.

**Format:**
```jsonl
{"op":"set","path":"/data","value":{"counter":0}}
{"op":"set","path":"/root","value":"card1"}
{"op":"add","path":"/elements/card1","value":{"type":"Card","props":{"title":"My Card"},"children":["text1"]}}
{"op":"add","path":"/elements/text1","value":{"type":"Text","props":{"content":"Hello"}}}
```

**Parser:** (`apps/generous/src/app/api/chat/route.ts:511-542`)
```typescript
function parseJSONLToTree(jsonl: string): { root, elements, data } | null {
  const lines = jsonl.trim().split("\n").filter(Boolean);
  let root = null;
  let data = undefined;
  const elements = {};

  for (const line of lines) {
    const patch = JSON.parse(line);
    if (patch.op === "set" && patch.path === "/root") root = patch.value;
    else if (patch.op === "set" && patch.path === "/data") data = patch.value;
    else if (patch.op === "add" && patch.path.startsWith("/elements/")) {
      const key = patch.path.replace("/elements/", "");
      elements[key] = patch.value;
    }
  }
  return { root, elements, data };
}
```

### 6.4 json-render Integration

**Purpose:** Renders UI trees to React components with reactive data binding.

**Integration Point:** (`apps/generous/src/components/StoredComponentRenderer.tsx`)

```tsx
<DataProvider initialData={tree.data || {}}>
  <VisibilityProvider>
    <ActionProvider handlers={handlers}>
      <Renderer tree={tree} registry={toolRegistry} loading={false} />
    </ActionProvider>
  </VisibilityProvider>
</DataProvider>
```

**Key Concepts:**
- **DataProvider:** Reactive data store for component state
- **ActionProvider:** Named action handlers (set, toggle, apiCall)
- **Renderer:** Walks tree and renders components from registry
- **toolRegistry:** Maps type names to React components

### 6.5 Client-Side Persistence (`lib/db.ts`)

**Purpose:** Persistent storage using IndexedDB.

**Stores:**
```typescript
interface GenerousDB extends DBSchema {
  chatHistory: {
    key: string;
    value: ChatMessage;
    indexes: { "by-created": number };
  };
  components: {
    key: string;
    value: StoredComponent;
    indexes: { "by-created": number };
  };
  gridLayout: {
    key: string;
    value: GridLayoutItem;
  };
}
```

**Key Operations:**
- `saveChatMessages()` - Batch save new messages
- `getRecentChatHistory(limit, beforeTimestamp)` - Paginated retrieval
- `saveComponent()` - Persist created widget
- `saveGridLayout()` - Persist dashboard layout

### 6.6 Intelligent Widget Placement (`app-state.tsx`)

**Purpose:** Automatically places new widgets in optimal positions.

**Algorithm (`addComponent`):**
1. Analyze component name/tree for size hints (table → larger, badge → smaller)
2. Build occupancy grid from existing layout
3. Score possible positions by:
   - Proximity to visible area (top preferred)
   - Position relative to chat widget
   - Minimizing fragmentation (prefer neighbors)
4. Place at highest-scoring valid position

**Evidence:** `apps/generous/src/lib/app-state.tsx:195-312`

---

## 7. Data Model and Persistence

### Client-Side (IndexedDB)

```typescript
// ChatMessage
interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;          // Text content
  parts?: unknown[];        // AI SDK v6 parts (tool calls, etc.)
  createdAt: number;
}

// StoredComponent
interface StoredComponent {
  id: string;
  name: string;             // "Weather Widget"
  jsonl: string;            // Raw JSONL source
  tree: {                   // Parsed tree for rendering
    root: string;
    elements: Record<string, unknown>;
    data?: Record<string, unknown>;
  };
  createdAt: number;
}

// GridLayoutItem
interface GridLayoutItem {
  i: string;                // Component ID
  x: number; y: number;     // Grid position
  w: number; h: number;     // Size in grid units
}
```

### Server-Side (PostgreSQL via Drizzle)

```typescript
// apps/generous/src/server/db/schema.ts

// Demo Pet Store Domain
pet: { id, name, species, breed, age, price, status, description, ... }
customer: { id, firstName, lastName, email, phone, address, ... }
order: { id, customerId, petId, status, quantity, totalPrice, ... }
inventory: { id, itemName, itemType, species, quantity, unitPrice, ... }
category: { id, name, description }
storeInfo: { id, name, address, isOpen, ... }

// Auth Domain (Better Auth)
user: { id, name, email, emailVerified, image, ... }
session: { id, token, userId, expiresAt, ... }
account: { id, userId, providerId, accessToken, ... }
verification: { id, identifier, value, expiresAt }
```

---

## 8. Interfaces, Protocols, and Implicit Contracts

### JSONL Patch Protocol (Implicit → Explicit)

**Contract:**
1. First `/data` patch (if present) sets initial state
2. Then `/root` patch sets the root element key
3. Then `/elements/{key}` patches add elements
4. Element structure:
   ```typescript
   {
     type: string;           // Must match tool-catalog component name
     props: Record<string, unknown>;  // Must match Zod schema
     children: string[];     // Array of element keys (NOT nested elements)
   }
   ```
5. All referenced child keys must have corresponding element patches

### Tool Output Contract for createComponent

```typescript
// Success
{ _isComponent: true, success: true, name: string, jsonl: string, tree: UITree }

// Failure
{ _isComponent: true, success: false, error: string, name: string }
```

### Action System Contract

```typescript
// Button/InteractiveCard action prop
action: {
  name: "set" | "toggle" | "toggleColor" | "increment" | "apiCall";
  params: {
    // For set: { path: string, value: unknown }
    // For toggle/toggleColor: { path: string }
    // For increment: { path: string, by?: number }
    // For apiCall: { endpoint, method?, bodyPaths?, revalidate?, successMessage?, resetPaths? }
  }
}
```

### Data Path Convention

- All data paths start with `/`
- Form data typically under `/form/*`
- API status at `/apiLoading`, `/apiError`, `/apiSuccess`
- Example: `/form/itemName`, `/counter`, `/card1Color`

---

## 9. Novel Ideas

### 9.1 Constrained AI UI Generation via Component Catalog

**What it is:** The AI generates UI by selecting from a pre-defined set of 47 components, each with Zod-validated props.

**How it differs:** Unlike systems that generate raw HTML/CSS, this approach:
- Guarantees type-safe, renderable output
- Prevents security issues (XSS, arbitrary code)
- Enables consistent design system adherence

**Why this choice:** The creator likely wanted:
- Predictable outputs for production use
- Faster generation (no CSS authoring)
- Ability to iterate on component library independently

**Risks:**
- Limited flexibility (can't create novel layouts)
- Component catalog becomes bottleneck
- AI may struggle with unusual requests

**Validation:** Test coverage should include edge cases where AI tries to create unsupported components.

### 9.2 JSONL Streaming for Progressive UI

**What it is:** UI is transmitted as newline-delimited JSON patches, allowing partial rendering during stream.

**Resembles:** JSON Patch (RFC 6902), but simplified and optimized for streaming.

**Why novel:** Most AI UI systems wait for complete response. This enables:
- Visible progress as UI builds
- Better perceived performance
- Ability to cancel mid-stream

**Risks:**
- Invalid intermediate states
- Parser complexity for partial JSON
- Error recovery is tricky

### 9.3 Widget Merging via AI

**What it is:** Dragging widgets on top of each other triggers an AI call to intelligently combine them.

**Innovation:** The merge operation is semantically aware, not just visual concatenation. The AI:
- Understands both components' purposes
- Combines data structures
- Creates coherent unified UI

**Risks:**
- Unpredictable results
- Lost functionality in merge
- User confusion about what merged

### 9.4 TPMJS Registry Integration

**What it is:** Dynamic tool discovery and sandboxed execution from a public registry.

**How it works:**
1. `registrySearch` finds tools by description
2. `registryExecute` runs them in remote sandbox with user-provided API keys
3. `RegistryFetcher` component auto-refreshes registry tool data

**Implications:**
- Infinite tool extensibility without code changes
- Security boundary via remote execution
- Dependency on external service availability

---

## 10. Observability and Operations

### Logging

- Uses `pino` + `pino-pretty` for structured logging
- Console.log debugging in development (visible in tool handlers)
- No production logging infrastructure observed

### Monitoring Gaps

**Not Found:**
- APM integration (Datadog, NewRelic)
- Error tracking (Sentry)
- Metrics collection
- Alerting configuration

**Recommendations:**
- Add Sentry for error tracking
- Instrument key paths (chat latency, tool execution time)
- Monitor IndexedDB storage usage

### Operations

**Deployment:** Vercel (inferred from `.vercel/` directory and `vercel.json`)
- `maxDuration = 60` for API routes (Vercel serverless limit)
- Standalone output for self-hosting option

**Database:** Neon PostgreSQL (serverless, connection via HTTP)

---

## 11. Security Model

### Authentication
- **Better Auth** with email/password
- Session management in PostgreSQL
- Currently appears optional (API routes don't enforce auth)

### Data Boundaries

| Data Type | Storage | Exposure Risk |
|-----------|---------|--------------|
| API Keys | Browser localStorage | Medium - XSS could leak |
| Chat History | IndexedDB | Low - client-only |
| Widget Definitions | IndexedDB | Low - client-only |
| Pet Store Data | PostgreSQL | Low - demo data |

### Security Risks

1. **API Key Storage:** Keys stored in localStorage are accessible to any JS on the page. Consider:
   - Using HttpOnly cookies for server-side storage
   - Encrypting localStorage values

2. **Registry Tool Execution:** User-provided params go to remote executor. Trust boundary exists at `executor.tpmjs.com`.

3. **No Auth on Demo APIs:** `/api/pets`, etc. have no authorization. Fine for demo, risky for real data.

4. **LLM Prompt Injection:** Malicious user input could attempt to manipulate AI behavior. Current system prompt is visible in code.

### Secrets Management

Required environment variables:
```
DATABASE_URL         - PostgreSQL connection string
BETTER_AUTH_SECRET   - 32+ char secret for sessions
BETTER_AUTH_URL      - Base URL for auth callbacks
```

---

## 12. Performance Model

### Client Performance

- **React 19** with concurrent features
- **Virtuoso** for virtualized chat messages (infinite scroll)
- **SWR** with configurable refresh intervals for data components
- **react-grid-layout** can be CPU-intensive with many widgets

**Hotspots:**
- Large chat histories (mitigated by pagination)
- Many simultaneous refreshing widgets
- Complex widget trees during rendering

### Server Performance

- **Serverless functions** (Next.js API routes on Vercel)
- **Neon HTTP driver** - connection-per-request, no pooling needed
- **OpenAI API** - main latency contributor (1-5s per call)

**Caching:**
- Turbo caches build artifacts
- SWR client-side caching with revalidation
- No server-side response caching observed

### Cost Considerations

- OpenAI API costs per request (gpt-4.1-mini is cheaper)
- Neon database usage (serverless pricing)
- Vercel function execution time

---

## 13. Testing Strategy and Current Coverage

### Test Configuration

```typescript
// apps/generous/vitest.config.ts
{
  environment: "happy-dom",
  testTimeout: 120000,  // 2 minutes for LLM tests
  include: ["tests/**/*.test.{ts,tsx}"],
  exclude: ["tests/e2e/**"],
}
```

### Test Categories

| Type | Location | Coverage |
|------|----------|----------|
| Unit | `tests/unit/` | Minimal (example only) |
| API Integration | `tests/api/` | Core endpoints tested |
| E2E | `tests/e2e/` | Smoke test only |

### Current Test Files

- `tests/api/chat.test.ts` - Validates SSE streaming, tool requests
- `tests/api/pets.test.ts` - CRUD operations
- `tests/api/customers.test.ts` - CRUD operations
- `tests/api/orders.test.ts` - CRUD operations
- `tests/api/inventory.test.ts` - CRUD operations
- `tests/api/components.test.ts` - Component creation
- `tests/e2e/smoke.test.ts` - Basic page load

### Coverage Gaps

- No component unit tests
- No json-render integration tests
- No IndexedDB persistence tests
- No error handling tests
- No security/auth tests

---

## 14. Roadmap Suggestions

### Next 30 Days (Foundation)

1. **Add Error Tracking**
   - Integrate Sentry for production error visibility
   - Add error boundaries around all widgets

2. **Improve Test Coverage**
   - Unit tests for `parseJSONLToTree`
   - Integration tests for tool-registry components
   - E2E test for full widget creation flow

3. **Secure API Keys**
   - Move API keys to server-side session storage
   - Add encryption layer for localStorage fallback

### Next 60 Days (Hardening)

4. **Add Authentication to APIs**
   - Require auth for mutation endpoints
   - Rate limiting per user

5. **Widget Versioning**
   - Store JSONL source for potential regeneration
   - Allow "edit" mode to refine widgets

6. **Performance Monitoring**
   - Add timing metrics to chat API
   - Monitor IndexedDB usage

### Next 90 Days (Features)

7. **Widget Templates**
   - Pre-built widget library
   - User can browse and instantiate

8. **Collaborative Features**
   - Export/import dashboard configurations
   - Share widget definitions

9. **Custom Component Registry**
   - Allow users to register custom components
   - Plugin architecture for tool-registry

---

## 15. Appendices

### A. Key Files and Why They Matter

| File | Importance | Why |
|------|------------|-----|
| `apps/generous/src/app/api/chat/route.ts` | Critical | All AI orchestration, tool definitions |
| `apps/generous/src/lib/tool-catalog.ts` | Critical | Defines entire UI vocabulary |
| `apps/generous/src/components/tool-registry.tsx` | Critical | Renders all AI-generated components |
| `apps/generous/src/lib/app-state.tsx` | High | Dashboard state management |
| `apps/generous/src/lib/db.ts` | High | All browser persistence |
| `apps/generous/src/components/Chat.tsx` | High | Chat UI and message handling |
| `apps/generous/src/app/page.tsx` | Medium | Dashboard layout and merge logic |
| `packages/ui/src/components/` | Medium | Foundation design system |

### B. Glossary

| Term | Definition in This Repo |
|------|------------------------|
| **JSONL Patch** | A line of JSON describing a UI tree modification |
| **Tool Catalog** | Zod schema definitions constraining AI component output |
| **Tool Registry** | Map of component type names to React implementations |
| **UITree** | Parsed structure `{root, elements, data}` for rendering |
| **TPMJS** | Third-party tool registry at tpmjs.com |
| **Widget** | A user-created, persistent UI component on the dashboard |
| **Data Path** | JSON Pointer-like string (`/form/name`) for reactive data binding |
| **Action** | Named operation (`set`, `toggle`, `apiCall`) triggered by UI |

### C. Open Questions and How to Answer Them

| Question | How to Investigate |
|----------|-------------------|
| How does the AI handle malformed requests? | Add test cases with invalid prompts, check error handling |
| What happens if IndexedDB quota is exceeded? | Test with large chat history, check for error handling |
| How robust is the JSONL parser to partial data? | Add fuzzing tests with truncated streams |
| Are there race conditions in multi-step tool execution? | Add concurrent request tests, inspect `stepCountIs` behavior |
| What's the maximum widget count before performance degrades? | Load test with 50+ widgets, profile react-grid-layout |
| How does the merge algorithm handle conflicting data? | Test merging widgets with overlapping `/data` keys |

---

*Report generated by analyzing the Generous repository. Last updated: 2026-02-04.*
