# Generous: The Application Operating System

## Product Requirements Document

**Version**: 1.0
**Status**: Vision Document
**Date**: February 2025

---

## Executive Summary

Generous is an **Application Operating System** that transforms the relationship between humans, AI, and software. Instead of building applications, users describe outcomes. Instead of integrating APIs, users compose tools. Instead of designing interfaces, users receive adaptive UI.

**The Core Insight**: By connecting a registry of 100,000+ executable tools (TPMJS) with a constrained component system (47 UI primitives), we create a platform where:

```
100,000 tools × 47 components = infinite applications
```

This isn't a low-code builder. It's a new computing paradigm where **tools are the atoms** and **composition is the program**.

---

## Problem Statement

### The Current State of Software

1. **Integration Hell**: Connecting Stripe to Slack to a database requires glue code, webhooks, authentication flows, and ongoing maintenance.

2. **UI Development Tax**: Every tool result needs custom rendering. A weather API needs a weather card. A stock API needs a chart. This mapping is done millions of times across the industry.

3. **Application Silos**: Retool builds dashboards. Zapier builds workflows. Notion builds documents. None of them compose into a unified experience.

4. **AI Capability Gap**: LLMs can reason about tools, but they can't execute them. They can describe UIs, but they can't render them safely.

### The Opportunity

What if every tool in the world was:
- **Discoverable** via natural language
- **Executable** with a single function call
- **Renderable** through a universal component system
- **Composable** into applications without code

---

## Product Vision

### Generous as Application OS

Just as an operating system provides:
- **Process management** → Generous provides **tool orchestration**
- **File system** → Generous provides **data flow graphs**
- **Device drivers** → Generous provides **API adapters (TPMJS)**
- **Window manager** → Generous provides **adaptive UI composition**

Users don't write applications. They describe intentions:

> "Show me my Stripe revenue, my GitHub issues, and alert me on Slack when revenue drops 10%"

Generous:
1. Discovers the required tools from TPMJS registry
2. Composes a data flow connecting them
3. Renders an adaptive dashboard
4. Schedules ongoing execution

### The Three Pillars

#### Pillar 1: Universal Tool Registry (TPMJS)

```
┌─────────────────────────────────────────────────────────────┐
│                    TPMJS Registry                           │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐           │
│  │ @stripe │ │ @github │ │ @openai │ │ @weather│  ...100k+ │
│  │  tools  │ │  tools  │ │  tools  │ │  tools  │           │
│  └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘           │
│       │           │           │           │                 │
│       └───────────┴───────────┴───────────┘                 │
│                       │                                     │
│              Unified Execution API                          │
│         POST /execute { toolId, params, env }               │
└─────────────────────────────────────────────────────────────┘
```

Every tool:
- Has a Zod schema defining inputs/outputs
- Is discoverable via semantic search
- Executes in a sandboxed environment
- Returns structured JSON

#### Pillar 2: Constrained Component System

```typescript
// The 47 components form a complete UI algebra
const componentAlgebra = {
  // Layout (compose space)
  Container, Stack, Grid, Card, Columns,

  // Data Display (render values)
  Text, Heading, Badge, Code, List, Table, KeyValue,

  // Data Fetch (bridge to tools)
  RegistryFetcher,  // ← The key innovation

  // Visualization (encode patterns)
  Stat, Progress, Chart, Sparkline,

  // Input (capture intent)
  Input, Button, Select, Checkbox, Form,

  // Feedback (communicate state)
  Alert, Spinner, Skeleton,

  // Media (embed content)
  Image, Avatar, Icon, Link,
};
```

**Why 47?** This isn't arbitrary. These components are:
- **Complete**: Can represent any dashboard, form, or data display
- **Constrained**: No arbitrary HTML/CSS injection
- **Composable**: Nest infinitely via `children` arrays
- **Portable**: Pure JSON, render anywhere

#### Pillar 3: AI Composition Engine

The AI doesn't generate code. It generates **component trees**:

```jsonl
{"op":"set","path":"/root","value":"dashboard_1"}
{"op":"set","path":"/elements/dashboard_1","value":{"type":"Container","children":["header_1","content_1"]}}
{"op":"set","path":"/elements/header_1","value":{"type":"Heading","text":"Revenue Dashboard"}}
{"op":"set","path":"/elements/content_1","value":{"type":"RegistryFetcher","toolId":"@stripe/api::getRevenue","children":["stat_1"]}}
{"op":"set","path":"/elements/stat_1","value":{"type":"Stat","label":"MRR","value":"{{data.mrr}}"}}
```

This JSONL format enables:
- **Streaming**: UI builds progressively as AI generates
- **Validation**: Each line validates against component schemas
- **Diffing**: Patches can update existing trees
- **Persistence**: Append-only log, trivially stored

---

## Key Innovation: RegistryFetcher

The bridge between infinite tools and finite components:

```typescript
interface RegistryFetcher {
  type: "RegistryFetcher";

  // What tool to execute
  toolId: string;           // "@stripe/api::listCustomers"
  params?: object;          // { limit: 10 }

  // How to render the result
  children: Component[];    // Components with {{data.x}} bindings

  // When to refresh
  refreshInterval?: number; // Auto-refresh in ms

  // Error handling
  errorChildren?: Component[];
  loadingChildren?: Component[];
}
```

**This single component type enables**:
- Weather widgets that refresh every hour
- Stock tickers that update every second
- GitHub issue lists that poll for changes
- Stripe dashboards with live revenue

The AI generates the tree. RegistryFetcher handles execution, caching, error states, and data binding. The user sees a working application.

---

## Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         User Intent                                  │
│            "Show my Stripe revenue with a chart"                    │
└─────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      AI Composition Engine                          │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐     │
│  │  Tool Discovery │  │  Tree Generator │  │  JSONL Streamer │     │
│  │  (TPMJS Search) │→ │  (Claude/GPT)   │→ │  (Validation)   │     │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘     │
└─────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      Component Tree (JSON)                          │
│  {                                                                  │
│    "root": "c1",                                                    │
│    "elements": {                                                    │
│      "c1": { "type": "Container", "children": ["c2", "c3"] },      │
│      "c2": { "type": "RegistryFetcher", "toolId": "@stripe/..." }, │
│      "c3": { "type": "Chart", "data": "{{data.revenue}}" }         │
│    }                                                                │
│  }                                                                  │
└─────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      Renderer (@json-render/react)                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                 │
│  │DataProvider │  │ActionProvider│  │VisibilityPr│                 │
│  │ (bindings)  │  │ (handlers)   │  │ (conditons) │                 │
│  └─────────────┘  └─────────────┘  └─────────────┘                 │
│                          │                                          │
│                          ▼                                          │
│                   Live Interactive UI                               │
└─────────────────────────────────────────────────────────────────────┘
```

### Data Flow

```
User Query
    │
    ▼
┌─────────────────┐
│ POST /api/chat  │
│                 │
│ 1. Parse intent │
│ 2. Search tools │◄──── TPMJS Registry (100k tools)
│ 3. Generate UI  │
│ 4. Stream JSONL │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Client Renderer │
│                 │
│ 1. Parse JSONL  │
│ 2. Build tree   │
│ 3. Render comp  │
│ 4. Execute tools│◄──── Tool Execution API
│ 5. Bind data    │
└────────┬────────┘
         │
         ▼
    Interactive
    Dashboard
```

---

## Evolution: ToolNode & Dataflow

### Current: RegistryFetcher (Pull-based)

Components pull data from tools on mount/refresh.

### Future: ToolNode (Push-based)

Tools become nodes in a reactive dataflow graph:

```typescript
interface ToolNode {
  id: string;
  toolId: string;
  params: Record<string, unknown>;

  // Reactive connections
  inputs: {
    [inputName: string]: {
      source: string;      // Another node's ID
      path: string;        // JSONPath to value
    }
  };

  // Output schema
  outputs: {
    [outputName: string]: {
      type: ZodSchema;
      description: string;
    }
  };

  // Scheduling
  schedule?: {
    type: "interval" | "cron" | "event";
    value: string;
  };

  // Error handling
  onError?: {
    retry: number;
    fallback?: string;  // Fallback node ID
  };
}
```

This enables:
- **Chained execution**: Output of one tool feeds input of another
- **Conditional branching**: Route data based on values
- **Scheduled jobs**: Cron-based execution
- **Event triggers**: React to webhooks

### Example: Revenue Alert System

```yaml
nodes:
  - id: fetch_revenue
    toolId: "@stripe/api::getRevenue"
    params: { period: "day" }
    schedule: { type: "cron", value: "0 * * * *" }  # Every hour

  - id: check_threshold
    toolId: "@generous/logic::compare"
    inputs:
      value: { source: "fetch_revenue", path: "$.mrr" }
      threshold: { source: "config", path: "$.alertThreshold" }

  - id: send_alert
    toolId: "@slack/api::postMessage"
    inputs:
      channel: { source: "config", path: "$.slackChannel" }
      message: { source: "fetch_revenue", path: "$.summary" }
    condition: { source: "check_threshold", path: "$.belowThreshold" }
```

---

## Competitive Positioning

### vs. Retool
| Aspect | Retool | Generous |
|--------|--------|----------|
| Tool integration | Manual API connections | 100k+ tools via TPMJS |
| UI generation | Drag-and-drop builder | AI-generated from intent |
| Learning curve | Hours to days | Minutes |
| Flexibility | High (custom code) | Constrained (47 components) |

**Generous wins**: Speed to working prototype, tool discoverability

### vs. Zapier
| Aspect | Zapier | Generous |
|--------|--------|----------|
| Focus | Automation workflows | Interactive applications |
| UI | None (headless) | Full component system |
| Execution | Server-side | Client + server |
| Customization | Limited transforms | AI-powered composition |

**Generous wins**: Visual output, interactive dashboards

### vs. Notion
| Aspect | Notion | Generous |
|--------|--------|----------|
| Content type | Documents, databases | Live tool compositions |
| Data freshness | Manual updates | Auto-refresh, real-time |
| Integration depth | Shallow embeds | Deep tool execution |
| AI role | Writing assistant | Application generator |

**Generous wins**: Live data, tool execution, dashboard layouts

### The Moat

1. **TPMJS Registry**: Network effects - more tools attract more users attract more tools
2. **Component Schemas**: Structured generation >> arbitrary code generation
3. **Composition Knowledge**: AI learns which tools + components work together
4. **Trust Graph**: Users validate tool quality, creating curation

---

## User Stories

### Story 1: The Founder Dashboard

**Persona**: Sarah, solo founder
**Need**: Single view of business health

> "I need to see Stripe revenue, GitHub activity, and my Vercel deployment status in one place."

**Generous Response**:
1. Discovers `@stripe/api`, `@github/api`, `@vercel/api` tools
2. Generates 3-column dashboard with:
   - Revenue stat card with sparkline
   - GitHub issues table with status badges
   - Deployment list with status indicators
3. Auto-refreshes every 5 minutes

**Time to working dashboard**: 30 seconds

### Story 2: The Customer Support Triage

**Persona**: Mike, support lead
**Need**: Prioritize incoming tickets

> "Show me Zendesk tickets sorted by sentiment, with customer Stripe history inline."

**Generous Response**:
1. Discovers `@zendesk/api::listTickets`, `@openai/api::analyzeSentiment`, `@stripe/api::getCustomer`
2. Composes a pipeline: tickets → sentiment analysis → enriched view
3. Generates table with expandable rows showing customer LTV
4. Color-codes by sentiment score

**Time to working tool**: 45 seconds

### Story 3: The Data Pipeline Monitor

**Persona**: Alex, data engineer
**Need**: Monitor ETL job health

> "Alert me on Slack when any Airbyte sync fails, show last 24h sync status."

**Generous Response**:
1. Discovers `@airbyte/api::listSyncs`, `@slack/api::postMessage`
2. Creates ToolNode graph with hourly polling
3. Generates dashboard with sync status cards
4. Configures conditional Slack notification on failure

**Time to working monitor**: 60 seconds

---

## Technical Requirements

### Phase 1: Foundation (Current)

- [x] Component registry (47 types)
- [x] TPMJS integration (search + execute)
- [x] JSONL streaming format
- [x] Basic dashboard layout (react-grid-layout)
- [x] Client-side persistence (IndexedDB)
- [x] RegistryFetcher with SWR caching

### Phase 2: ToolNode Dataflow

- [ ] ToolNode schema definition
- [ ] Visual dataflow editor
- [ ] Node execution engine
- [ ] Conditional branching
- [ ] Scheduled execution (cron)
- [ ] Webhook triggers

### Phase 3: Toolspace Mounts

- [ ] Capability-based tool access
- [ ] Per-dashboard tool permissions
- [ ] Tool namespacing (`/stripe/*`, `/internal/*`)
- [ ] Cost tracking per tool execution
- [ ] Rate limiting and quotas

### Phase 4: Application OS

- [ ] Persistent dashboard URLs
- [ ] Sharing and collaboration
- [ ] Version history
- [ ] Template library
- [ ] Marketplace for tool compositions

---

## Success Metrics

### North Star
**Applications created per user per week**

### Supporting Metrics

| Metric | Target | Rationale |
|--------|--------|-----------|
| Time to first widget | < 30s | Immediate value demonstration |
| Tools used per dashboard | > 3 | Composition is the value |
| Dashboard retention (7d) | > 60% | Dashboards are useful |
| Tool discovery success | > 80% | TPMJS search quality |
| Component render success | > 99% | Schema validation works |

---

## Risks & Mitigations

### Risk 1: Tool Quality Variance
**Problem**: TPMJS tools may have bugs, downtime, or unexpected behavior
**Mitigation**:
- Tool health scores based on execution success
- Fallback rendering for failed tools
- User-reported quality signals

### Risk 2: AI Hallucination
**Problem**: AI may generate invalid component trees or reference nonexistent tools
**Mitigation**:
- Strict Zod validation on every JSONL line
- Tool existence check before generation
- Graceful degradation with error boundaries

### Risk 3: Security/Credential Leakage
**Problem**: Tools require API keys that could be exposed
**Mitigation**:
- Client-side localStorage for credentials (never sent to our servers)
- Environment variable injection at execution time
- No credential persistence in component trees

### Risk 4: Infinite Tool Space
**Problem**: 100k tools is overwhelming, users can't find what they need
**Mitigation**:
- Semantic search over tool descriptions
- "Popular" and "recommended" tool surfacing
- AI-assisted tool discovery in conversation

---

## Appendix A: Component Catalog

| Category | Components |
|----------|------------|
| Layout | Container, Stack, Grid, Card, Columns, Divider |
| Typography | Text, Heading, Code, Markdown |
| Data Display | Badge, List, Table, KeyValue, Tree |
| Data Fetch | RegistryFetcher |
| Visualization | Stat, Progress, Chart, Sparkline, Gauge |
| Input | Input, Button, Select, Checkbox, Radio, Switch, Slider, Form |
| Feedback | Alert, Spinner, Skeleton, Toast |
| Media | Image, Avatar, Icon, Link |
| Navigation | Tabs, Accordion, Breadcrumb |

---

## Appendix B: TPMJS Integration

### Discovery
```typescript
// Search for tools by natural language
const tools = await tpmjs.search("stripe revenue metrics");
// Returns: [@stripe/api::getRevenue, @stripe/api::getMRR, ...]
```

### Execution
```typescript
// Execute a tool with parameters
const result = await tpmjs.execute({
  toolId: "@stripe/api::getRevenue",
  params: { period: "month" },
  env: { STRIPE_API_KEY: "sk_..." }
});
```

### Schema Access
```typescript
// Get tool input/output schema
const schema = await tpmjs.getSchema("@stripe/api::getRevenue");
// Returns Zod schema for validation
```

---

## Appendix C: JSONL Format Specification

```jsonl
// Set root element
{"op":"set","path":"/root","value":"element_id"}

// Define element
{"op":"set","path":"/elements/element_id","value":{"type":"ComponentType","prop":"value"}}

// Set initial data
{"op":"set","path":"/data/keyName","value":"initial_value"}

// Update existing element
{"op":"set","path":"/elements/element_id/prop","value":"new_value"}

// Remove element
{"op":"delete","path":"/elements/element_id"}
```

Validation rules:
- Each line must be valid JSON
- `op` must be "set" or "delete"
- `path` must be valid JSON Pointer (RFC 6901)
- `value.type` must be in component catalog
- All props must match component schema

---

*Generous: Where tools compose into applications.*
