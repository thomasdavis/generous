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

      // Add to grid layout - find a spot
      const newLayoutItem: GridLayoutItem = {
        i: fullComponent.id,
        x: (gridLayout.length * 4) % 12,
        y: Infinity, // react-grid-layout will find the right y
        w: 4,
        h: 3,
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
