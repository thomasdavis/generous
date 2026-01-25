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

      // Calculate the next available position
      // Find the bottom of all existing items
      const cols = 12;
      const itemWidth = 4;
      const itemHeight = 3;

      // Create a height map for each column
      const colHeights = new Array(cols).fill(0);
      for (const item of gridLayout) {
        const itemBottom = item.y + item.h;
        for (let col = item.x; col < item.x + item.w && col < cols; col++) {
          colHeights[col] = Math.max(colHeights[col], itemBottom);
        }
      }

      // Find the best position (lowest y where itemWidth columns are available)
      let bestX = 0;
      let bestY = Math.max(...colHeights);

      // Try to find a spot that fits
      for (let x = 0; x <= cols - itemWidth; x++) {
        const maxHeightInSpan = Math.max(...colHeights.slice(x, x + itemWidth));
        if (maxHeightInSpan < bestY) {
          bestY = maxHeightInSpan;
          bestX = x;
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
