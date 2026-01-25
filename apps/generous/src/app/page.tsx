"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import RGL from "react-grid-layout";

// Cast to fix type issues with react-grid-layout
const GridLayout = RGL as unknown as React.ComponentType<{
  className?: string;
  layout: Array<{ i: string; x: number; y: number; w: number; h: number }>;
  cols: number;
  rowHeight: number;
  width: number;
  draggableHandle?: string;
  onLayoutChange?: (
    layout: Array<{ i: string; x: number; y: number; w: number; h: number }>,
  ) => void;
  onDragStop?: (
    layout: Array<{ i: string; x: number; y: number; w: number; h: number }>,
    oldItem: { i: string; x: number; y: number; w: number; h: number },
    newItem: { i: string; x: number; y: number; w: number; h: number },
    placeholder: unknown,
    event: MouseEvent,
    element: HTMLElement,
  ) => void;
  compactType?: string;
  preventCollision?: boolean;
  children?: React.ReactNode;
}>;

import { Button } from "@generous/ui";
import { Chat } from "@/components/Chat";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { MergeModal } from "@/components/MergeModal";
import { StoredComponentRenderer } from "@/components/StoredComponentRenderer";
import { AppStateProvider, useAppState } from "@/lib/app-state";
import type { GridLayoutItem, StoredComponent } from "@/lib/db";

import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import styles from "./page.module.css";

interface MergePending {
  componentA: StoredComponent;
  componentB: StoredComponent;
  position: { x: number; y: number };
}

function Dashboard() {
  const {
    isLoaded,
    components,
    gridLayout,
    updateGridLayout,
    exportState,
    clearAll,
    mergeComponents,
  } = useAppState();

  const [width, setWidth] = useState(1200);
  const [copied, setCopied] = useState(false);
  const [mergePending, setMergePending] = useState<MergePending | null>(null);
  const [isMerging, setIsMerging] = useState(false);
  const layoutBeforeDrag = useRef<GridLayoutItem[]>([]);

  useEffect(() => {
    setWidth(window.innerWidth);
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLayoutChange = useCallback(
    (newLayout: Array<{ i: string; x: number; y: number; w: number; h: number }>) => {
      // Check if layout actually changed to prevent unnecessary updates
      const layoutChanged =
        newLayout.length !== gridLayout.length ||
        newLayout.some((item) => {
          const existing = gridLayout.find((g) => g.i === item.i);
          if (!existing) return true;
          return (
            existing.x !== item.x ||
            existing.y !== item.y ||
            existing.w !== item.w ||
            existing.h !== item.h
          );
        });

      if (!layoutChanged) return;

      const items: GridLayoutItem[] = newLayout.map((item) => ({
        i: item.i,
        x: item.x,
        y: item.y,
        w: item.w,
        h: item.h,
      }));
      updateGridLayout(items);
    },
    [updateGridLayout, gridLayout],
  );

  // Check if two items overlap significantly (more than 50% area)
  const checkOverlap = useCallback(
    (
      itemA: { x: number; y: number; w: number; h: number },
      itemB: { x: number; y: number; w: number; h: number },
    ) => {
      const overlapX = Math.max(
        0,
        Math.min(itemA.x + itemA.w, itemB.x + itemB.w) - Math.max(itemA.x, itemB.x),
      );
      const overlapY = Math.max(
        0,
        Math.min(itemA.y + itemA.h, itemB.y + itemB.h) - Math.max(itemA.y, itemB.y),
      );
      const overlapArea = overlapX * overlapY;
      const smallerArea = Math.min(itemA.w * itemA.h, itemB.w * itemB.h);
      return overlapArea >= smallerArea * 0.5;
    },
    [],
  );

  const handleDragStop = useCallback(
    (
      layout: Array<{ i: string; x: number; y: number; w: number; h: number }>,
      _oldItem: { i: string; x: number; y: number; w: number; h: number },
      newItem: { i: string; x: number; y: number; w: number; h: number },
    ) => {
      // Don't allow merging with chat
      if (newItem.i === "chat") return;

      // Find any other component that overlaps with the dropped item
      for (const item of layout) {
        // Skip chat, skip self
        if (item.i === "chat" || item.i === newItem.i) continue;

        if (checkOverlap(newItem, item)) {
          // Found an overlap! Get the components
          const componentA = components.find((c) => c.id === newItem.i);
          const componentB = components.find((c) => c.id === item.i);

          if (componentA && componentB) {
            // Store the layout before drag to restore if cancelled
            layoutBeforeDrag.current = gridLayout;

            // Show merge modal
            setMergePending({
              componentA,
              componentB,
              position: { x: Math.min(newItem.x, item.x), y: Math.min(newItem.y, item.y) },
            });
            return;
          }
        }
      }
    },
    [components, gridLayout, checkOverlap],
  );

  const handleMerge = useCallback(async () => {
    if (!mergePending) return;

    setIsMerging(true);

    try {
      // Call the merge API
      const response = await fetch("/api/merge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          componentA: mergePending.componentA,
          componentB: mergePending.componentB,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Merge the components
        await mergeComponents(
          mergePending.componentA.id,
          mergePending.componentB.id,
          {
            name: data.name,
            jsonl: data.jsonl,
            tree: data.tree,
          },
          mergePending.position,
        );
      } else {
        console.error("Merge failed:", data.error);
      }
    } catch (error) {
      console.error("Merge error:", error);
    } finally {
      setIsMerging(false);
      setMergePending(null);
    }
  }, [mergePending, mergeComponents]);

  const handleMergeCancel = useCallback(() => {
    // Restore the layout to before the drag
    if (layoutBeforeDrag.current.length > 0) {
      updateGridLayout(layoutBeforeDrag.current);
    }
    setMergePending(null);
  }, [updateGridLayout]);

  const handleExport = async () => {
    const state = await exportState();
    await navigator.clipboard.writeText(JSON.stringify(state, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClearAll = async () => {
    if (confirm("Clear all data? This will remove all widgets and chat history.")) {
      await clearAll();
      window.location.reload();
    }
  };

  if (!isLoaded) {
    return (
      <main className={styles.container}>
        <div className={styles.loading}>Loading...</div>
      </main>
    );
  }

  return (
    <main className={styles.container}>
      <div className={styles.toolbar}>
        <div className={styles.logo}>Generous</div>
        <div className={styles.toolbarActions}>
          <Button variant="ghost" size="sm" asChild>
            <a href="/styleguide" target="_blank" rel="noopener noreferrer">
              Design System
            </a>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <a href="/styleguide/catalog" target="_blank" rel="noopener noreferrer">
              Component Catalog
            </a>
          </Button>
          <Button variant="ghost" size="sm" onClick={handleExport}>
            {copied ? "Copied!" : "Export State"}
          </Button>
          <Button variant="ghost" size="sm" onClick={handleClearAll}>
            Clear All
          </Button>
        </div>
      </div>

      <GridLayout
        className="layout"
        layout={gridLayout}
        cols={12}
        rowHeight={100}
        width={width - 48}
        draggableHandle=".drag-handle"
        onLayoutChange={handleLayoutChange}
        onDragStop={handleDragStop}
        compactType="vertical"
        preventCollision={false}
      >
        {/* Chat Widget - always present */}
        <div key="chat" className={styles.gridItem}>
          <ErrorBoundary>
            <Chat />
          </ErrorBoundary>
        </div>

        {/* User-created components */}
        {components.map((component) => (
          <div key={component.id} className={styles.gridItem}>
            <ErrorBoundary>
              <StoredComponentRenderer component={component} />
            </ErrorBoundary>
          </div>
        ))}
      </GridLayout>

      {/* Merge Modal */}
      {mergePending && (
        <MergeModal
          componentA={mergePending.componentA}
          componentB={mergePending.componentB}
          onMerge={handleMerge}
          onCancel={handleMergeCancel}
          isMerging={isMerging}
        />
      )}
    </main>
  );
}

export default function HomePage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <main className={styles.container} />;
  }

  return (
    <AppStateProvider>
      <Dashboard />
    </AppStateProvider>
  );
}
