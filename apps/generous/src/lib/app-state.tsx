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
  getActiveDashboard,
  getChatHistory,
  getComponents,
  getGridLayout,
  type StoredComponent,
  saveChatMessage,
  saveComponent,
  saveGridLayout,
  setActiveDashboard,
} from "./db";
import { getSyncManager } from "./sync/queue";

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

// Dashboard info type (server or local)
interface DashboardInfo {
  id: string | null; // null = local-only mode
  slug?: string;
  name: string;
  description?: string;
  isPublic: boolean;
  role: string;
  isServerDashboard: boolean;
}

interface AppStateContextValue {
  // Loading state
  isLoaded: boolean;

  // Dashboard context
  currentDashboard: DashboardInfo;
  setCurrentDashboard: (dashboardId: string | null) => Promise<void>;
  createDashboard: (name: string) => Promise<DashboardInfo>;
  updateDashboard: (
    updates: Partial<Pick<DashboardInfo, "name" | "description" | "isPublic">>,
  ) => Promise<void>;

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

  // Sync status
  syncStatus: "idle" | "syncing" | "error" | "offline";
  syncNow: () => Promise<void>;
}

const AppStateContext = createContext<AppStateContextValue | null>(null);

const DEFAULT_DASHBOARD: DashboardInfo = {
  id: null,
  name: "Local Dashboard",
  isPublic: false,
  role: "owner",
  isServerDashboard: false,
};

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentDashboard, setCurrentDashboardState] = useState<DashboardInfo>(DEFAULT_DASHBOARD);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [components, setComponents] = useState<StoredComponent[]>([]);
  const [gridLayout, setGridLayout] = useState<GridLayoutItem[]>([]);
  const [syncStatus, setSyncStatus] = useState<"idle" | "syncing" | "error" | "offline">("idle");

  // Subscribe to sync manager status
  useEffect(() => {
    const syncManager = getSyncManager();
    const unsubscribe = syncManager.onStatusChange((status) => {
      setSyncStatus(status);
    });
    return unsubscribe;
  }, []);

  // Load initial state from IndexedDB and server
  useEffect(() => {
    async function loadState() {
      try {
        // Load chat history (always local)
        const chat = await getChatHistory();
        setChatHistory(chat);

        // Check for active dashboard
        const activeDashboardId = await getActiveDashboard();

        if (activeDashboardId) {
          // Try to load from server
          try {
            const response = await fetch(`/api/dashboards/${activeDashboardId}`);
            if (response.ok) {
              const dashboard = await response.json();
              setCurrentDashboardState({
                id: dashboard.id,
                slug: dashboard.slug,
                name: dashboard.name,
                description: dashboard.description,
                isPublic: dashboard.isPublic,
                role: dashboard.role || "owner",
                isServerDashboard: true,
              });
              setComponents(dashboard.components || []);
              const layout = dashboard.gridLayout || [{ i: "chat", x: 0, y: 0, w: 4, h: 4 }];
              const hasChat = layout.some((item: GridLayoutItem) => item.i === "chat");
              if (!hasChat) {
                layout.unshift({ i: "chat", x: 0, y: 0, w: 4, h: 4 });
              }
              setGridLayout(layout);
              setIsLoaded(true);
              return;
            }
          } catch {
            // Server not available, fall back to local
            console.warn("Server not available, using local state");
          }
        }

        // Fall back to local storage
        const [comps, layout] = await Promise.all([getComponents(), getGridLayout()]);
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
    setCurrentDashboardState(DEFAULT_DASHBOARD);
  }, []);

  // Dashboard management
  const setCurrentDashboardFn = useCallback(async (dashboardId: string | null) => {
    await setActiveDashboard(dashboardId);

    if (!dashboardId) {
      // Switch to local mode
      setCurrentDashboardState(DEFAULT_DASHBOARD);
      const [comps, layout] = await Promise.all([getComponents(), getGridLayout()]);
      setComponents(comps);
      const hasChat = layout.some((item) => item.i === "chat");
      if (!hasChat) {
        layout.unshift({ i: "chat", x: 0, y: 0, w: 4, h: 4 });
      }
      setGridLayout(layout);
      return;
    }

    // Fetch from server
    const response = await fetch(`/api/dashboards/${dashboardId}`);
    if (!response.ok) {
      throw new Error("Failed to load dashboard");
    }

    const dashboard = await response.json();
    setCurrentDashboardState({
      id: dashboard.id,
      slug: dashboard.slug,
      name: dashboard.name,
      description: dashboard.description,
      isPublic: dashboard.isPublic,
      role: dashboard.role || "owner",
      isServerDashboard: true,
    });
    setComponents(dashboard.components || []);
    const layout = dashboard.gridLayout || [{ i: "chat", x: 0, y: 0, w: 4, h: 4 }];
    const hasChat = layout.some((item: GridLayoutItem) => item.i === "chat");
    if (!hasChat) {
      layout.unshift({ i: "chat", x: 0, y: 0, w: 4, h: 4 });
    }
    setGridLayout(layout);
  }, []);

  const createDashboard = useCallback(async (name: string): Promise<DashboardInfo> => {
    const response = await fetch("/api/dashboards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });

    if (!response.ok) {
      throw new Error("Failed to create dashboard");
    }

    const dashboard = await response.json();
    return {
      id: dashboard.id,
      slug: dashboard.slug,
      name: dashboard.name,
      description: dashboard.description,
      isPublic: dashboard.isPublic,
      role: "owner",
      isServerDashboard: true,
    };
  }, []);

  const updateDashboard = useCallback(
    async (updates: Partial<Pick<DashboardInfo, "name" | "description" | "isPublic">>) => {
      if (!currentDashboard.id) {
        // Local mode - just update local state
        setCurrentDashboardState((prev) => ({ ...prev, ...updates }));
        return;
      }

      const response = await fetch(`/api/dashboards/${currentDashboard.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error("Failed to update dashboard");
      }

      const dashboard = await response.json();
      setCurrentDashboardState((prev) => ({
        ...prev,
        name: dashboard.name,
        description: dashboard.description,
        isPublic: dashboard.isPublic,
        slug: dashboard.slug,
      }));
    },
    [currentDashboard.id],
  );

  const syncNow = useCallback(async () => {
    const syncManager = getSyncManager();
    await syncManager.syncNow();
  }, []);

  return (
    <AppStateContext.Provider
      value={{
        isLoaded,
        currentDashboard,
        setCurrentDashboard: setCurrentDashboardFn,
        createDashboard,
        updateDashboard,
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
        syncStatus,
        syncNow,
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
