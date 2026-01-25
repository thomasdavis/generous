"use client";

import { ActionProvider, DataProvider, Renderer, VisibilityProvider } from "@json-render/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import styles from "./Chat.module.css";
import { toolRegistry } from "./tool-registry";

// UITree type matches the json-render expected structure
interface UITree {
  root: string;
  elements: Record<string, unknown>;
  data?: Record<string, unknown>;
}

// Color cycle for toggle actions
const colorCycle = ["blue", "green", "red", "purple", "orange", "yellow", "pink", "teal"];

const debugStyles = {
  container: {
    marginTop: 8,
    borderTop: "1px solid #333",
    paddingTop: 8,
  },
  toggle: {
    background: "transparent",
    border: "1px solid #444",
    borderRadius: 4,
    color: "#888",
    fontSize: 11,
    padding: "4px 8px",
    cursor: "pointer",
    marginRight: 8,
  },
  copyBtn: {
    background: "#2563eb",
    border: "none",
    borderRadius: 4,
    color: "#fff",
    fontSize: 11,
    padding: "4px 8px",
    cursor: "pointer",
  },
  pre: {
    background: "#1a1a1a",
    border: "1px solid #333",
    borderRadius: 4,
    padding: 8,
    marginTop: 8,
    fontSize: 10,
    maxHeight: 200,
    overflow: "auto",
    whiteSpace: "pre-wrap" as const,
    wordBreak: "break-all" as const,
    color: "#a3e635",
  },
  copied: {
    color: "#22c55e",
    fontSize: 11,
    marginLeft: 8,
  },
};

interface ToolResultRendererProps {
  toolName: string;
  toolData: unknown;
}

// Parse JSONL stream and build UI tree
function parseJSONLToTree(jsonl: string): UITree | null {
  const lines = jsonl.trim().split("\n").filter(Boolean);
  let root: string | null = null;
  let data: Record<string, unknown> | undefined;
  const elements: Record<string, unknown> = {};

  for (const line of lines) {
    try {
      const patch = JSON.parse(line);
      if (patch.op === "set" && patch.path === "/root") {
        root = patch.value;
      } else if (patch.op === "set" && patch.path === "/data") {
        data = patch.value;
      } else if (patch.op === "add" && patch.path.startsWith("/elements/")) {
        const key = patch.path.replace("/elements/", "");
        elements[key] = patch.value;
      }
    } catch {
      // Skip invalid JSON lines
    }
  }

  if (!root || Object.keys(elements).length === 0) {
    return null;
  }

  return { root, elements, data };
}

export function ToolResultRenderer({ toolName, toolData }: ToolResultRendererProps) {
  const [tree, setTree] = useState<UITree | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [streamText, setStreamText] = useState("");
  const [showDebug, setShowDebug] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function fetchUI() {
      setIsLoading(true);
      setError(null);
      setStreamText("");

      try {
        const response = await fetch("/api/render-tool", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ toolName, toolData }),
        });

        if (!response.ok) {
          throw new Error(`Failed to render tool: ${response.status}`);
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error("No response body");

        const decoder = new TextDecoder();
        let accumulated = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done || cancelled) break;

          accumulated += decoder.decode(value, { stream: true });
          setStreamText(accumulated);

          // Try to parse accumulated JSONL
          const parsed = parseJSONLToTree(accumulated);
          if (parsed) {
            setTree(parsed);
          }
        }

        // Final parse
        const finalTree = parseJSONLToTree(accumulated);
        if (finalTree) {
          setTree(finalTree);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Unknown error");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    fetchUI();

    return () => {
      cancelled = true;
    };
  }, [toolName, toolData]);

  if (error) {
    return (
      <div className={styles.toolCall}>
        <span style={{ color: "#ef4444" }}>Error: {error}</span>
      </div>
    );
  }

  if (isLoading && !tree) {
    return (
      <div className={styles.toolCall}>
        <div className={styles.toolSpinner} />
        <span>Rendering {toolName}...</span>
      </div>
    );
  }

  if (!tree) {
    // Fallback to raw JSON display
    return (
      <div className={styles.toolCall}>
        <pre style={{ fontSize: 11, margin: 0, whiteSpace: "pre-wrap" }}>
          {JSON.stringify(toolData, null, 2)}
        </pre>
      </div>
    );
  }

  const debugPanel = (
    <div style={debugStyles.container}>
      <button type="button" style={debugStyles.toggle} onClick={() => setShowDebug(!showDebug)}>
        {showDebug ? "Hide" : "Show"} JSONL
      </button>
      <button type="button" style={debugStyles.copyBtn} onClick={() => copyToClipboard(streamText)}>
        Copy JSONL
      </button>
      <button
        type="button"
        style={{ ...debugStyles.copyBtn, marginLeft: 4 }}
        onClick={() => copyToClipboard(JSON.stringify(tree, null, 2))}
      >
        Copy Tree
      </button>
      {copied && <span style={debugStyles.copied}>Copied!</span>}
      {showDebug && <pre style={debugStyles.pre}>{streamText || "(no JSONL yet)"}</pre>}
    </div>
  );

  return (
    <div style={{ marginTop: 8 }}>
      <InteractiveTreeRenderer tree={tree} isLoading={isLoading} />
      {debugPanel}
    </div>
  );
}

function InteractiveTreeRenderer({ tree, isLoading }: { tree: UITree; isLoading: boolean }) {
  const [data, setData] = useState<Record<string, unknown>>(() => tree.data || {});

  const handlers = useMemo(
    () => ({
      set: (params: { path?: string; value?: unknown }) => {
        if (params.path) {
          setData((prev) => {
            const key = params.path?.replace(/^\//, "") || "";
            return key ? { ...prev, [key]: params.value } : prev;
          });
        }
      },
      toggleColor: (params: { path?: string }) => {
        if (params.path) {
          setData((prev) => {
            const key = params.path?.replace(/^\//, "") || "";
            const currentColor = (prev[key] as string) || "blue";
            const currentIndex = colorCycle.indexOf(currentColor);
            const nextIndex = (currentIndex + 1) % colorCycle.length;
            return { ...prev, [key]: colorCycle[nextIndex] };
          });
        }
      },
      increment: (params: { path?: string; by?: number }) => {
        if (params.path) {
          setData((prev) => {
            const key = params.path?.replace(/^\//, "") || "";
            const current = (prev[key] as number) || 0;
            return { ...prev, [key]: current + (params.by || 1) };
          });
        }
      },
      toggle: (params: { path?: string }) => {
        if (params.path) {
          setData((prev) => {
            const key = params.path?.replace(/^\//, "") || "";
            return { ...prev, [key]: !prev[key] };
          });
        }
      },
    }),
    [],
  );

  const handleDataChange = useCallback((path: string, value: unknown) => {
    const key = path.replace(/^\//, "");
    if (key) {
      setData((prev) => ({ ...prev, [key]: value }));
    }
  }, []);

  return (
    <DataProvider initialData={data} onDataChange={handleDataChange}>
      <VisibilityProvider>
        <ActionProvider handlers={handlers}>
          {/* biome-ignore lint/suspicious/noExplicitAny: json-render types are incomplete */}
          <Renderer tree={tree as any} registry={toolRegistry} loading={isLoading} />
        </ActionProvider>
      </VisibilityProvider>
    </DataProvider>
  );
}
