"use client";

import { ActionProvider, DataProvider, Renderer, VisibilityProvider } from "@json-render/react";
import { useAppState } from "@/lib/app-state";
import type { StoredComponent } from "@/lib/db";
import { toolRegistry } from "./tool-registry";

// UITree type matches the json-render expected structure
interface UITree {
  root: string;
  elements: Record<string, unknown>;
}

interface StoredComponentRendererProps {
  component: StoredComponent;
}

export function StoredComponentRenderer({ component }: StoredComponentRendererProps) {
  const { removeComponent } = useAppState();

  const tree = component.tree as UITree | null;

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
        <button
          type="button"
          style={styles.closeBtn}
          onClick={() => removeComponent(component.id)}
          title="Remove component"
        >
          ×
        </button>
      </div>
      <div style={styles.content}>
        <DataProvider initialData={{}}>
          <VisibilityProvider>
            <ActionProvider handlers={{}}>
              {/* biome-ignore lint/suspicious/noExplicitAny: json-render types are incomplete */}
              <Renderer tree={tree as any} registry={toolRegistry} loading={false} />
            </ActionProvider>
          </VisibilityProvider>
        </DataProvider>
      </div>
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
  error: {
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#ef4444",
    fontSize: 13,
  },
};
