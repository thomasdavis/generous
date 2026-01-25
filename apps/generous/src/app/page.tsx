"use client";

import { useCallback, useEffect, useState } from "react";
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
  compactType?: string;
  preventCollision?: boolean;
  children?: React.ReactNode;
}>;

import { Button } from "@generous/ui";
import { Chat } from "@/components/Chat";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { StoredComponentRenderer } from "@/components/StoredComponentRenderer";
import { AppStateProvider, useAppState } from "@/lib/app-state";
import type { GridLayoutItem } from "@/lib/db";

import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import styles from "./page.module.css";

function Dashboard() {
  const { isLoaded, components, gridLayout, updateGridLayout, exportState, clearAll } =
    useAppState();

  const [width, setWidth] = useState(1200);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setWidth(window.innerWidth);
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLayoutChange = useCallback(
    (newLayout: Array<{ i: string; x: number; y: number; w: number; h: number }>) => {
      const items: GridLayoutItem[] = newLayout.map((item) => ({
        i: item.i,
        x: item.x,
        y: item.y,
        w: item.w,
        h: item.h,
      }));
      updateGridLayout(items);
    },
    [updateGridLayout],
  );

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
