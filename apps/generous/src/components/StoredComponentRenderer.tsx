"use client";

import { ActionProvider, DataProvider, Renderer, VisibilityProvider } from "@json-render/react";
import { useCallback, useMemo, useState } from "react";
import { useAppState } from "@/lib/app-state";
import type { StoredComponent } from "@/lib/db";
import { toolRegistry } from "./tool-registry";

// UITree type matches the json-render expected structure
interface UITree {
  root: string;
  elements: Record<string, unknown>;
  data?: Record<string, unknown>;
}

interface StoredComponentRendererProps {
  component: StoredComponent;
}

// Color cycle for toggle actions
const colorCycle = ["blue", "green", "red", "purple", "orange", "yellow", "pink", "teal"];

function InteractiveRenderer({ tree }: { tree: UITree }) {
  // Initialize state from tree.data or empty
  const [data, setData] = useState<Record<string, unknown>>(() => tree.data || {});

  // Action handlers that can update state
  const handlers = useMemo(
    () => ({
      // Generic set action: { name: "set", params: { path: "/foo", value: "bar" } }
      set: (params: { path?: string; value?: unknown }) => {
        if (params.path) {
          setData((prev) => {
            const newData = { ...prev };
            // Simple path handling for top-level keys like "/card1Color"
            const key = params.path?.replace(/^\//, "") || "";
            if (key) {
              newData[key] = params.value;
            }
            return newData;
          });
        }
      },
      // Toggle color action: { name: "toggleColor", params: { path: "/card1Color" } }
      toggleColor: (params: { path?: string }) => {
        if (params.path) {
          setData((prev) => {
            const newData = { ...prev };
            const key = params.path?.replace(/^\//, "") || "";
            const currentColor = (newData[key] as string) || "blue";
            const currentIndex = colorCycle.indexOf(currentColor);
            const nextIndex = (currentIndex + 1) % colorCycle.length;
            newData[key] = colorCycle[nextIndex];
            return newData;
          });
        }
      },
      // Increment action: { name: "increment", params: { path: "/count", by: 1 } }
      increment: (params: { path?: string; by?: number }) => {
        if (params.path) {
          setData((prev) => {
            const newData = { ...prev };
            const key = params.path?.replace(/^\//, "") || "";
            const current = (newData[key] as number) || 0;
            newData[key] = current + (params.by || 1);
            return newData;
          });
        }
      },
      // Toggle boolean: { name: "toggle", params: { path: "/isOpen" } }
      toggle: (params: { path?: string }) => {
        if (params.path) {
          setData((prev) => {
            const newData = { ...prev };
            const key = params.path?.replace(/^\//, "") || "";
            newData[key] = !newData[key];
            return newData;
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
          <Renderer tree={tree as any} registry={toolRegistry} loading={false} />
        </ActionProvider>
      </VisibilityProvider>
    </DataProvider>
  );
}

export function StoredComponentRenderer({ component }: StoredComponentRendererProps) {
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
      <div style={styles.error}>
        <span>Failed to render component</span>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <span style={styles.title} className="drag-handle">
          {component.name}
        </span>
        <div style={styles.headerActions}>
          <button
            type="button"
            style={styles.headerBtn}
            onClick={() => setShowJson(!showJson)}
            title={showJson ? "Hide JSON" : "Show JSON"}
          >
            {showJson ? "Hide" : "JSON"}
          </button>
          <button type="button" style={styles.headerBtn} onClick={copyJson} title="Copy JSON">
            {copied ? "Copied!" : "Copy"}
          </button>
          <button
            type="button"
            style={styles.closeBtn}
            onClick={() => removeComponent(component.id)}
            title="Remove component"
          >
            ×
          </button>
        </div>
      </div>
      {showJson ? (
        <div style={styles.jsonView}>
          <pre style={styles.jsonPre}>{JSON.stringify(component.tree, null, 2)}</pre>
        </div>
      ) : (
        <div style={styles.content}>
          <InteractiveRenderer tree={tree} />
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    height: "100%",
    display: "flex",
    flexDirection: "column",
    background: "#18181b",
    borderRadius: 12,
    border: "1px solid #27272a",
    overflow: "hidden",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "8px 12px",
    borderBottom: "1px solid #27272a",
    background: "#1f1f23",
  },
  title: {
    fontSize: 13,
    fontWeight: 500,
    color: "#a1a1aa",
    cursor: "grab",
    flex: 1,
  },
  headerActions: {
    display: "flex",
    alignItems: "center",
    gap: 4,
  },
  headerBtn: {
    background: "transparent",
    border: "1px solid #3f3f46",
    borderRadius: 4,
    color: "#71717a",
    fontSize: 11,
    cursor: "pointer",
    padding: "2px 6px",
  },
  closeBtn: {
    background: "transparent",
    border: "none",
    color: "#71717a",
    fontSize: 18,
    cursor: "pointer",
    padding: "0 4px",
    lineHeight: 1,
  },
  content: {
    flex: 1,
    padding: 12,
    overflow: "auto",
  },
  jsonView: {
    flex: 1,
    overflow: "auto",
    padding: 8,
  },
  jsonPre: {
    margin: 0,
    fontSize: 10,
    color: "#a3e635",
    whiteSpace: "pre-wrap",
    wordBreak: "break-all",
  },
  error: {
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#ef4444",
    fontSize: 13,
  },
};
