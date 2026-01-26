"use client";

import { createContext, type ReactNode, useCallback, useContext, useEffect, useState } from "react";
import {
  type AppState,
  type ChatMessage,
  clearAllData,
  clearChatHistory,
  deleteComponent,
  exportAppState,
  type GridLayoutItem,
  getChatHistory,
  getComponents,
  getGridLayout,
  type StoredComponent,
  saveChatMessage,
  saveComponent,
  saveGridLayout,
} from "./db";

/**
 * Analyzes component characteristics to determine optimal grid size.
 * Returns width (in columns, max 12) and height (in rows).
 */
function getOptimalSize(name: string, tree: unknown): { width: number; height: number } {
  const nameLower = name.toLowerCase();

  // Analyze the tree structure to detect component types
  const treeStr = JSON.stringify(tree).toLowerCase();

  // Large components: tables, charts, dashboards, grids
  const isLarge =
    nameLower.includes("table") ||
    nameLower.includes("chart") ||
    nameLower.includes("dashboard") ||
    nameLower.includes("grid") ||
    nameLower.includes("list") ||
    treeStr.includes('"type":"table"') ||
    treeStr.includes('"type":"chart"') ||
    treeStr.includes('"type":"grid"');

  // Wide components: timelines, progress bars, headers
  const isWide =
    nameLower.includes("timeline") ||
    nameLower.includes("progress") ||
    nameLower.includes("header") ||
    nameLower.includes("banner") ||
    nameLower.includes("navigation") ||
    nameLower.includes("toolbar");

  // Tall components: lists, feeds, sidebars
  const isTall =
    nameLower.includes("sidebar") ||
    nameLower.includes("feed") ||
    nameLower.includes("menu") ||
    nameLower.includes("navigation");

  // Small/compact components: badges, buttons, status indicators
  const isSmall =
    nameLower.includes("badge") ||
    nameLower.includes("button") ||
    nameLower.includes("indicator") ||
    nameLower.includes("status") ||
    nameLower.includes("icon");

  // Medium components: cards, metrics, stats
  const isMedium =
    nameLower.includes("card") ||
    nameLower.includes("metric") ||
    nameLower.includes("stat") ||
    nameLower.includes("weather") ||
    nameLower.includes("stock") ||
    nameLower.includes("price");

  // Count children to estimate complexity
  const childCount = (treeStr.match(/"children":/g) || []).length;
  const hasMultipleItems = childCount > 5;

  // Determine size based on analysis
  if (isLarge || hasMultipleItems) {
    return { width: 8, height: 5 };
  }

  if (isWide) {
    return { width: 8, height: 2 };
  }

  if (isTall) {
    return { width: 4, height: 5 };
  }

  if (isSmall) {
    return { width: 3, height: 2 };
  }

  if (isMedium) {
    return { width: 4, height: 3 };
  }

  // Default: medium-sized component
  return { width: 4, height: 3 };
}

interface AppStateContextValue {
  // Loading state
  isLoaded: boolean;

  // Chat
  chatHistory: ChatMessage[];
  addChatMessage: (message: Omit<ChatMessage, "id" | "createdAt">) => Promise<ChatMessage>;
  clearChat: () => Promise<void>;

  // Components
  components: StoredComponent[];
  addComponent: (component: Omit<StoredComponent, "id" | "createdAt">) => Promise<StoredComponent>;
  removeComponent: (id: string) => Promise<void>;
  mergeComponents: (
    idA: string,
    idB: string,
    mergedComponent: Omit<StoredComponent, "id" | "createdAt">,
    position: { x: number; y: number },
  ) => Promise<StoredComponent>;

  // Grid layout
  gridLayout: GridLayoutItem[];
  updateGridLayout: (layout: GridLayoutItem[]) => Promise<void>;

  // Export
  exportState: () => Promise<AppState>;
  clearAll: () => Promise<void>;
}

const AppStateContext = createContext<AppStateContextValue | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [components, setComponents] = useState<StoredComponent[]>([]);
  const [gridLayout, setGridLayout] = useState<GridLayoutItem[]>([]);

  // Load initial state from IndexedDB
  useEffect(() => {
    async function loadState() {
      try {
        const [chat, comps, layout] = await Promise.all([
          getChatHistory(),
          getComponents(),
          getGridLayout(),
        ]);
        setChatHistory(chat);
        setComponents(comps);

        // Ensure chat widget is always in layout
        const hasChat = layout.some((item) => item.i === "chat");
        if (!hasChat) {
          layout.unshift({ i: "chat", x: 0, y: 0, w: 4, h: 4 });
        }
        setGridLayout(layout);
        setIsLoaded(true);
      } catch (err) {
        console.error("Failed to load state:", err);
        // Start with default state
        setGridLayout([{ i: "chat", x: 0, y: 0, w: 4, h: 4 }]);
        setIsLoaded(true);
      }
    }
    loadState();
  }, []);

  const addChatMessage = useCallback(
    async (message: Omit<ChatMessage, "id" | "createdAt">): Promise<ChatMessage> => {
      const fullMessage: ChatMessage = {
        ...message,
        id: crypto.randomUUID(),
        createdAt: Date.now(),
      };
      await saveChatMessage(fullMessage);
      setChatHistory((prev) => [...prev, fullMessage]);
      return fullMessage;
    },
    [],
  );

  const clearChat = useCallback(async () => {
    await clearChatHistory();
    setChatHistory([]);
  }, []);

  const addComponent = useCallback(
    async (component: Omit<StoredComponent, "id" | "createdAt">): Promise<StoredComponent> => {
      const fullComponent: StoredComponent = {
        ...component,
        id: crypto.randomUUID(),
        createdAt: Date.now(),
      };
      await saveComponent(fullComponent);
      setComponents((prev) => [...prev, fullComponent]);

      // Intelligent placement algorithm
      const cols = 12;
      const maxRows = 20; // Virtual grid height for gap detection

      // Determine optimal size based on component characteristics
      const { width: itemWidth, height: itemHeight } = getOptimalSize(
        component.name,
        component.tree,
      );

      // Build an occupancy grid to find gaps
      const grid: boolean[][] = Array.from({ length: maxRows }, () => Array(cols).fill(false));

      for (const item of gridLayout) {
        for (let y = item.y; y < Math.min(item.y + item.h, maxRows); y++) {
          for (let x = item.x; x < Math.min(item.x + item.w, cols); x++) {
            const row = grid[y];
            if (row) row[x] = true;
          }
        }
      }

      // Find the chat widget position for proximity preference
      const chatItem = gridLayout.find((item) => item.i === "chat");
      const chatRight = chatItem ? chatItem.x + chatItem.w : 0;
      const chatBottom = chatItem ? chatItem.y + chatItem.h : 0;

      // Score function for position quality
      const scorePosition = (x: number, y: number): number => {
        let score = 0;

        // Strongly prefer positions beside/below the chat (visible area)
        if (y < 6) score += 100; // Prefer top of viewport
        if (x >= chatRight && y < chatBottom) score += 50; // Beside chat is great

        // Prefer filling rows (lower y is better, but prefer right side of same row)
        score -= y * 20;
        score += x * 2; // Slight preference for right-to-left fill

        // Prefer positions that don't create fragmentation
        // Check if this fills a gap nicely
        const hasLeftNeighbor = x > 0 && grid[y]?.[x - 1];
        const hasTopNeighbor = y > 0 && grid[y - 1]?.[x];
        if (hasLeftNeighbor) score += 10;
        if (hasTopNeighbor) score += 10;

        return score;
      };

      // Find all valid positions and score them
      let bestX = 0;
      let bestY = maxRows;
      let bestScore = Number.NEGATIVE_INFINITY;

      for (let y = 0; y <= maxRows - itemHeight; y++) {
        for (let x = 0; x <= cols - itemWidth; x++) {
          // Check if this position is clear
          let isClear = true;
          for (let dy = 0; dy < itemHeight && isClear; dy++) {
            for (let dx = 0; dx < itemWidth && isClear; dx++) {
              if (grid[y + dy]?.[x + dx]) {
                isClear = false;
              }
            }
          }

          if (isClear) {
            const score = scorePosition(x, y);
            if (score > bestScore) {
              bestScore = score;
              bestX = x;
              bestY = y;
            }
          }
        }
      }

      // Fallback: if no position found in virtual grid, place at bottom
      if (bestY >= maxRows) {
        const colHeights = new Array(cols).fill(0);
        for (const item of gridLayout) {
          const itemBottom = item.y + item.h;
          for (let col = item.x; col < item.x + item.w && col < cols; col++) {
            colHeights[col] = Math.max(colHeights[col], itemBottom);
          }
        }
        bestY = Math.max(...colHeights);
        // Find best X at this Y level
        let minHeight = Number.POSITIVE_INFINITY;
        for (let x = 0; x <= cols - itemWidth; x++) {
          const maxHeightInSpan = Math.max(...colHeights.slice(x, x + itemWidth));
          if (maxHeightInSpan < minHeight) {
            minHeight = maxHeightInSpan;
            bestX = x;
            bestY = maxHeightInSpan;
          }
        }
      }

      const newLayoutItem: GridLayoutItem = {
        i: fullComponent.id,
        x: bestX,
        y: bestY,
        w: itemWidth,
        h: itemHeight,
      };
      const newLayout = [...gridLayout, newLayoutItem];
      await saveGridLayout(newLayout);
      setGridLayout(newLayout);

      return fullComponent;
    },
    [gridLayout],
  );

  const removeComponent = useCallback(
    async (id: string) => {
      await deleteComponent(id);
      setComponents((prev) => prev.filter((c) => c.id !== id));

      const newLayout = gridLayout.filter((item) => item.i !== id);
      await saveGridLayout(newLayout);
      setGridLayout(newLayout);
    },
    [gridLayout],
  );

  const mergeComponents = useCallback(
    async (
      idA: string,
      idB: string,
      mergedComponent: Omit<StoredComponent, "id" | "createdAt">,
      position: { x: number; y: number },
    ): Promise<StoredComponent> => {
      // Create the new merged component
      const fullComponent: StoredComponent = {
        ...mergedComponent,
        id: crypto.randomUUID(),
        createdAt: Date.now(),
      };
      await saveComponent(fullComponent);

      // Remove the two old components
      await deleteComponent(idA);
      await deleteComponent(idB);

      // Update components state
      setComponents((prev) => [...prev.filter((c) => c.id !== idA && c.id !== idB), fullComponent]);

      // Update grid layout - remove old items, add new one at the specified position
      const newLayout = gridLayout
        .filter((item) => item.i !== idA && item.i !== idB)
        .concat({
          i: fullComponent.id,
          x: position.x,
          y: position.y,
          w: 4,
          h: 4, // Slightly larger for merged content
        });
      await saveGridLayout(newLayout);
      setGridLayout(newLayout);

      return fullComponent;
    },
    [gridLayout],
  );

  const updateGridLayout = useCallback(async (layout: GridLayoutItem[]) => {
    // Ensure chat is always present
    const hasChat = layout.some((item) => item.i === "chat");
    if (!hasChat) {
      layout.unshift({ i: "chat", x: 0, y: 0, w: 4, h: 4 });
    }
    await saveGridLayout(layout);
    setGridLayout(layout);
  }, []);

  const exportStateCallback = useCallback(async () => {
    return exportAppState();
  }, []);

  const clearAll = useCallback(async () => {
    await clearAllData();
    setChatHistory([]);
    setComponents([]);
    setGridLayout([{ i: "chat", x: 0, y: 0, w: 4, h: 4 }]);
  }, []);

  return (
    <AppStateContext.Provider
      value={{
        isLoaded,
        chatHistory,
        addChatMessage,
        clearChat,
        components,
        addComponent,
        removeComponent,
        mergeComponents,
        gridLayout,
        updateGridLayout,
        exportState: exportStateCallback,
        clearAll,
      }}
    >
      {children}
    </AppStateContext.Provider>
  );
}

export function useAppState(): AppStateContextValue {
  const ctx = useContext(AppStateContext);
  if (!ctx) {
    throw new Error("useAppState must be used within AppStateProvider");
  }
  return ctx;
}
