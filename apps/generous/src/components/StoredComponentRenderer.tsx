"use client";

import {
  ActionProvider,
  DataProvider,
  Renderer,
  useData,
  VisibilityProvider,
} from "@json-render/react";
import { useCallback, useMemo, useState } from "react";
import { mutate } from "swr";
import { useAppState } from "@/lib/app-state";
import type { StoredComponent } from "@/lib/db";
import styles from "./StoredComponentRenderer.module.css";
import { toolRegistry } from "./tool-registry";

// UITree type matches the json-render expected structure
interface UITree {
  root: string;
  elements: Record<string, unknown>;
  data?: Record<string, unknown>;
}

interface StoredComponentRendererProps {
  component: StoredComponent;
  readOnly?: boolean;
}

// Color cycle for toggle actions
const colorCycle = ["blue", "green", "red", "purple", "orange", "yellow", "pink", "teal"];

// Inner component that has access to DataProvider's context
function InteractiveRendererInner({ tree }: { tree: UITree }) {
  const { get, set } = useData();

  // Action handlers that use DataProvider's get/set functions directly
  const handlers = useMemo(
    () => ({
      set: (params: { path?: string; value?: unknown }) => {
        console.log("[Handler] set called with:", params);
        if (params.path) {
          set(params.path, params.value);
        }
      },
      toggleColor: (params: { path?: string }) => {
        console.log("[Handler] toggleColor called with:", params);
        if (params.path) {
          const currentColor = (get(params.path) as string) || "blue";
          const currentIndex = colorCycle.indexOf(currentColor);
          const nextIndex = (currentIndex + 1) % colorCycle.length;
          const newColor = colorCycle[nextIndex];
          console.log("[Handler] toggleColor from", currentColor, "to", newColor);
          set(params.path, newColor);
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

            // Set success state
            set("/apiSuccess", successMessage || "Success!");
            set("/apiLoading", false);

            // Reset form fields if specified
            if (resetPaths) {
              for (const path of resetPaths) {
                set(path, "");
              }
            }

            // Clear success message after 3 seconds
            setTimeout(() => set("/apiSuccess", null), 3000);

            // Revalidate SWR caches for related endpoints
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
        <Renderer tree={tree as any} registry={toolRegistry} loading={false} />
      </ActionProvider>
    </VisibilityProvider>
  );
}

function InteractiveRenderer({ tree }: { tree: UITree }) {
  console.log("[InteractiveRenderer] initializing with tree.data:", tree.data);

  return (
    <DataProvider initialData={tree.data || {}}>
      <InteractiveRendererInner tree={tree} />
    </DataProvider>
  );
}

export function StoredComponentRenderer({
  component,
  readOnly = false,
}: StoredComponentRendererProps) {
  const { removeComponent } = useAppState();
  const [showJson, setShowJson] = useState(false);
  const [copied, setCopied] = useState(false);

  const tree = component.tree as UITree | null;

  const copyJson = useCallback(async () => {
    const json = JSON.stringify({ tree: component.tree, jsonl: component.jsonl }, null, 2);
    await navigator.clipboard.writeText(json);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [component]);

  if (!tree) {
    return (
      <div className={styles.error}>
        <span>Failed to render component</span>
        {component.jsonl && (
          <pre
            style={{ fontSize: 10, whiteSpace: "pre-wrap", wordBreak: "break-all", marginTop: 8 }}
          >
            {component.jsonl}
          </pre>
        )}
      </div>
    );
  }

  // Read-only mode for public dashboards
  if (readOnly) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <span className={styles.title}>{component.name}</span>
        </div>
        <div className={styles.content}>
          <InteractiveRenderer tree={tree} />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span className={`${styles.title} drag-handle`}>{component.name}</span>
        <div className={`${styles.headerActions} no-drag`} onMouseDown={(e) => e.stopPropagation()}>
          <button
            type="button"
            className={styles.headerBtn}
            onClick={() => setShowJson(!showJson)}
            title={showJson ? "Hide JSON" : "Show JSON"}
          >
            {showJson ? "Hide" : "JSON"}
          </button>
          <button type="button" className={styles.headerBtn} onClick={copyJson} title="Copy JSON">
            {copied ? "Copied!" : "Copy"}
          </button>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={() => removeComponent(component.id)}
            title="Remove component"
          >
            ×
          </button>
        </div>
      </div>
      {showJson ? (
        <div className={`${styles.jsonView} no-drag`} onMouseDown={(e) => e.stopPropagation()}>
          <pre className={styles.jsonPre}>{JSON.stringify(component.tree, null, 2)}</pre>
        </div>
      ) : (
        <div className={`${styles.content} no-drag`} onMouseDown={(e) => e.stopPropagation()}>
          <InteractiveRenderer tree={tree} />
        </div>
      )}
    </div>
  );
}
