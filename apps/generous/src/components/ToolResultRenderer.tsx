"use client";

import {
  ActionProvider,
  DataProvider,
  Renderer,
  useData,
  VisibilityProvider,
} from "@json-render/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { mutate } from "swr";
import { parseJSONLToTree, type UITree } from "@/lib/parse-jsonl";
import styles from "./Chat.module.css";
import { toolRegistry } from "./tool-registry";

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

// parseJSONLToTree imported from @/lib/parse-jsonl

export function ToolResultRenderer({ toolName, toolData }: ToolResultRendererProps) {
  const [tree, setTree] = useState<UITree | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [streamText, setStreamText] = useState("");
  const [showDebug, setShowDebug] = useState(false);
  const [copied, setCopied] = useState(false);

  // Stabilize toolData by serializing - prevents re-fetching on object reference changes
  const toolDataKey = useMemo(() => JSON.stringify(toolData), [toolData]);
  const fetchedKeyRef = useRef<string | null>(null);

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
    // Skip if we've already fetched for this exact data
    const cacheKey = `${toolName}:${toolDataKey}`;
    if (fetchedKeyRef.current === cacheKey) {
      return;
    }
    fetchedKeyRef.current = cacheKey;

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
  }, [toolName, toolDataKey, toolData]);

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

// Inner component that has access to DataProvider's context
function InteractiveTreeRendererInner({ tree, isLoading }: { tree: UITree; isLoading: boolean }) {
  const { get, set } = useData();

  // Action handlers that use DataProvider's get/set functions directly
  const handlers = useMemo(
    () => ({
      set: (params: { path?: string; value?: unknown }) => {
        if (params.path) {
          set(params.path, params.value);
        }
      },
      toggleColor: (params: { path?: string }) => {
        if (params.path) {
          const currentColor = (get(params.path) as string) || "blue";
          const currentIndex = colorCycle.indexOf(currentColor);
          const nextIndex = (currentIndex + 1) % colorCycle.length;
          set(params.path, colorCycle[nextIndex]);
        }
      },
      increment: (params: { path?: string; by?: number }) => {
        if (params.path) {
          const current = (get(params.path) as number) || 0;
          set(params.path, current + (params.by || 1));
        }
      },
      toggle: (params: { path?: string }) => {
        if (params.path) {
          const current = get(params.path);
          set(params.path, !current);
        }
      },
      // API call action - makes HTTP requests to the API
      apiCall: (params: Record<string, unknown>) => {
        const {
          endpoint,
          method = "POST",
          bodyPaths,
          body,
          revalidate,
          successMessage,
          resetPaths,
        } = params as {
          endpoint: string;
          method?: string;
          bodyPaths?: Record<string, string>;
          body?: Record<string, unknown>;
          revalidate?: string[];
          successMessage?: string;
          resetPaths?: string[];
        };

        console.log("[Handler] apiCall called with:", params);

        // Build request body from data paths or use provided body
        const requestBody: Record<string, unknown> = body || {};
        if (bodyPaths) {
          for (const [key, path] of Object.entries(bodyPaths)) {
            const value = get(path);
            if (value !== undefined && value !== null && value !== "") {
              requestBody[key] = value;
            }
          }
        }

        console.log("[Handler] apiCall making request:", { endpoint, method, requestBody });

        // Set loading state
        set("/apiLoading", true);
        set("/apiError", null);

        fetch(endpoint, {
          method,
          headers: { "Content-Type": "application/json" },
          body: method !== "GET" ? JSON.stringify(requestBody) : undefined,
        })
          .then((response) => response.json().then((data) => ({ response, data })))
          .then(({ response, data }) => {
            if (!response.ok) {
              throw new Error(data.error || `Request failed: ${response.status}`);
            }

            console.log("[Handler] apiCall success:", data);

            set("/apiSuccess", successMessage || "Success!");
            set("/apiLoading", false);

            if (resetPaths) {
              for (const path of resetPaths) {
                set(path, "");
              }
            }

            setTimeout(() => set("/apiSuccess", null), 3000);

            if (revalidate) {
              for (const path of revalidate) {
                mutate((key) => typeof key === "string" && key.startsWith(path), undefined, {
                  revalidate: true,
                });
              }
            }
          })
          .catch((error) => {
            console.error("[Handler] apiCall error:", error);
            set("/apiLoading", false);
            set("/apiError", error instanceof Error ? error.message : "Request failed");
            setTimeout(() => set("/apiError", null), 5000);
          });
      },
    }),
    [get, set],
  );

  return (
    <VisibilityProvider>
      <ActionProvider handlers={handlers}>
        {/* biome-ignore lint/suspicious/noExplicitAny: json-render types are incomplete */}
        <Renderer tree={tree as any} registry={toolRegistry} loading={isLoading} />
      </ActionProvider>
    </VisibilityProvider>
  );
}

function InteractiveTreeRenderer({ tree, isLoading }: { tree: UITree; isLoading: boolean }) {
  return (
    <DataProvider initialData={tree.data || {}}>
      <InteractiveTreeRendererInner tree={tree} isLoading={isLoading} />
    </DataProvider>
  );
}
