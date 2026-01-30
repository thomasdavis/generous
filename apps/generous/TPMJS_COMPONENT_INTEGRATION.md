# TPMJS Registry Execute Integration for Dynamic Components

## The Goal

When a user chats and executes ANY tool from the TPMJS registry (via search + execute), the AI should be able to generate a JSONL component that:

1. **Re-executes that same arbitrary tool on refresh**
2. **Renders the result appropriately**
3. **Works with ANY tool** - not just predefined ones

## Core Concept: `RegistryFetcher` Component

A single generic component that can fetch from ANY registry tool:

```typescript
RegistryFetcher: ({
  toolId,        // "@tpmjs/tools-unsandbox::listServices" - ANY tool
  params,        // { status: "running" } - ANY params the tool accepts
  dataKey,       // Optional: extract nested key from response (e.g., "services")
  refreshInterval, // Auto-refresh in ms
  title,         // Optional display title
}) => {
  // Fetches from registry execute on mount and refresh
  // Renders result as formatted JSON or table
}
```

## Example Flow

### 1. User chats:
```
"What unsandbox services do I have?"
```

### 2. AI searches and executes:
```
registrySearch({ query: "unsandbox services" })
  → finds @tpmjs/tools-unsandbox::listServices

registryExecute({
  toolId: "@tpmjs/tools-unsandbox::listServices",
  params: {}
})
  → returns { services: [...] }
```

### 3. AI creates component with same call:
```jsonl
{"op":"set","path":"/root","value":"card1"}
{"op":"add","path":"/elements/card1","value":{"type":"Card","props":{"title":"Unsandbox Services"},"children":["fetcher1"]}}
{"op":"add","path":"/elements/fetcher1","value":{"type":"RegistryFetcher","props":{"toolId":"@tpmjs/tools-unsandbox::listServices","params":{},"dataKey":"services","refreshInterval":10000}}}
```

### 4. On page refresh:
- Component mounts
- Calls `/api/registry-execute` with same toolId + params
- Env vars from Settings automatically injected
- Renders fresh data

## Implementation

### 1. API Route: `/api/registry-execute/route.ts`

Server-side endpoint that:
- Receives toolId + params from client
- Reads env vars from localStorage (passed via header or cookie)
- Calls TPMJS executor with env vars
- Returns result

```typescript
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const { toolId, params } = await req.json();

  // Get env vars from request header
  const envVarsHeader = req.headers.get("x-generous-env-vars");
  const envVars = envVarsHeader ? JSON.parse(envVarsHeader) : {};

  // Parse toolId
  const [packageName, name] = toolId.split("::");
  if (!packageName || !name) {
    return Response.json({ error: true, message: "Invalid toolId format" });
  }

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

    const result = await response.json();

    if (!result.success) {
      return Response.json({ error: true, message: result.error });
    }

    return Response.json({ success: true, data: result.output });
  } catch (error) {
    return Response.json({
      error: true,
      message: error instanceof Error ? error.message : "Execution failed"
    });
  }
}
```

### 2. Component: `RegistryFetcher` in tool-registry.tsx

```typescript
RegistryFetcher: ({
  toolId,
  params = {},
  dataKey,
  refreshInterval = 10000,
  title,
}: {
  toolId: string;
  params?: Record<string, unknown>;
  dataKey?: string;
  refreshInterval?: number;
  title?: string;
}) => {
  // Get env vars from localStorage
  const getEnvVars = () => {
    if (typeof window === "undefined") return {};
    try {
      const stored = localStorage.getItem("generous-env-vars");
      if (!stored) return {};
      const vars = JSON.parse(stored);
      return vars.reduce((acc: Record<string, string>, v: { key: string; value: string }) => {
        acc[v.key] = v.value;
        return acc;
      }, {});
    } catch {
      return {};
    }
  };

  // Create stable cache key
  const cacheKey = useMemo(
    () => `registry:${toolId}:${JSON.stringify(params)}`,
    [toolId, params]
  );

  const fetcher = useCallback(async () => {
    const envVars = getEnvVars();
    const response = await fetch("/api/registry-execute", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-generous-env-vars": JSON.stringify(envVars),
      },
      body: JSON.stringify({ toolId, params }),
    });
    return response.json();
  }, [toolId, params]);

  const { data, error, isLoading } = useSWR(cacheKey, fetcher, {
    refreshInterval,
    revalidateOnFocus: true,
  });

  if (isLoading) {
    return (
      <div style={{ padding: "var(--space-4)", color: "var(--text-secondary)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
          <Spinner size="sm" />
          <span>Fetching from {toolId}...</span>
        </div>
      </div>
    );
  }

  if (error || data?.error) {
    return (
      <div style={{ padding: "var(--space-4)", color: "var(--color-error)" }}>
        Error: {data?.message || error?.message || "Failed to fetch"}
      </div>
    );
  }

  // Extract data if dataKey specified
  const displayData = dataKey && data?.data ? data.data[dataKey] : data?.data;

  // Render as formatted JSON or auto-detect array for table
  if (Array.isArray(displayData)) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
        {title && <div style={{ fontWeight: 600, marginBottom: "var(--space-2)" }}>{title}</div>}
        <div style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)" }}>
          {displayData.length} items from {toolId}
        </div>
        {displayData.map((item, idx) => (
          <div
            key={item.id || idx}
            style={{
              padding: "var(--space-3)",
              background: "var(--surface-secondary)",
              borderRadius: "var(--radius-md)",
              fontFamily: "var(--font-mono)",
              fontSize: "var(--text-xs)",
              overflow: "auto",
            }}
          >
            <pre style={{ margin: 0 }}>{JSON.stringify(item, null, 2)}</pre>
          </div>
        ))}
      </div>
    );
  }

  // Single object or primitive - render as JSON
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
      {title && <div style={{ fontWeight: 600 }}>{title}</div>}
      <div style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)" }}>
        Result from {toolId}
      </div>
      <pre
        style={{
          padding: "var(--space-3)",
          background: "var(--surface-secondary)",
          borderRadius: "var(--radius-md)",
          fontFamily: "var(--font-mono)",
          fontSize: "var(--text-xs)",
          overflow: "auto",
          margin: 0,
        }}
      >
        {JSON.stringify(displayData, null, 2)}
      </pre>
    </div>
  );
}
```

### 3. Register Component in toolRegistry

```typescript
// In tool-registry.tsx
export const toolRegistry = {
  // ... existing components ...
  RegistryFetcher: RegistryFetcherComponent,
};
```

### 4. Add to Tool Catalog

```typescript
// In tool-catalog.ts
export const componentList = `
// ... existing components ...

## Registry Data Components

- RegistryFetcher: Fetches data from ANY TPMJS registry tool on mount and auto-refreshes
  Props:
  - toolId (required): The tool identifier (e.g., "@tpmjs/tools-unsandbox::listServices")
  - params: Object of parameters to pass to the tool (default: {})
  - dataKey: Optional key to extract from response (e.g., "services" to get data.services)
  - refreshInterval: Auto-refresh interval in ms (default: 10000)
  - title: Optional title to display above the data

  Use this component when the user wants a persistent widget that fetches data from a registry tool.
  The component will automatically use the user's API keys from Settings.

  Example - Show Unsandbox Services:
  {"op":"add","path":"/elements/services","value":{"type":"RegistryFetcher","props":{"toolId":"@tpmjs/tools-unsandbox::listServices","params":{},"dataKey":"services","refreshInterval":10000,"title":"My Services"}}}

  Example - Web Search Results:
  {"op":"add","path":"/elements/search","value":{"type":"RegistryFetcher","props":{"toolId":"@exalabs/ai-sdk::webSearch","params":{"query":"latest AI news"},"refreshInterval":60000,"title":"AI News"}}}
`;
```

### 5. Update System Prompt

Add to the chat system prompt:

```
## CREATING WIDGETS FROM REGISTRY TOOLS

When the user asks you to execute a registry tool AND wants to see that data persistently:

1. First use registrySearch to find the tool
2. Use registryExecute to run it and show the results
3. If they want a persistent widget, use createComponent with RegistryFetcher

The RegistryFetcher component can call ANY registry tool on mount and refresh:

{"type":"RegistryFetcher","props":{
  "toolId":"@package/name::toolName",  // The exact toolId you executed
  "params":{...},                       // The exact params you used
  "dataKey":"services",                 // Optional: extract nested key
  "refreshInterval":10000,              // Refresh every 10s
  "title":"Widget Title"
}}

This way, when the user refreshes the page, the widget will re-fetch the data automatically.
```

## Summary

**One component (`RegistryFetcher`) handles ALL registry tools:**

| User Request | AI Action |
|--------------|-----------|
| "Show my unsandbox services" | Execute tool, then create `RegistryFetcher` with same toolId + params |
| "Search web for AI news" | Execute tool, then create `RegistryFetcher` with search query |
| "List my exe.dev VMs" | Execute tool, then create `RegistryFetcher` for VM listing |

**The component is fully generic:**
- Works with ANY toolId
- Passes ANY params
- Extracts ANY dataKey from response
- Renders result as formatted JSON (arrays shown as cards, objects as JSON)
- Auto-refreshes at specified interval
- Env vars automatically injected from Settings

## Implementation Checklist

- [x] Create `/api/registry-execute/route.ts`
- [x] Create `RegistryFetcher` component in `tool-registry.tsx`
- [x] Register in `toolRegistry`
- [x] Add to `tool-catalog.ts` component documentation
- [x] Update chat system prompt to explain usage
- [ ] Test with various tools
