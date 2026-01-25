"use client";

import { type DBSchema, type IDBPDatabase, openDB } from "idb";

// Types for our stored data
export interface StoredComponent {
  id: string;
  name: string;
  jsonl: string;
  tree: unknown;
  createdAt: number;
}

export interface GridLayoutItem {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  parts?: unknown[];
  createdAt: number;
}

export interface AppState {
  chatHistory: ChatMessage[];
  components: StoredComponent[];
  gridLayout: GridLayoutItem[];
}

interface GenerousDB extends DBSchema {
  chatHistory: {
    key: string;
    value: ChatMessage;
    indexes: { "by-created": number };
  };
  components: {
    key: string;
    value: StoredComponent;
    indexes: { "by-created": number };
  };
  gridLayout: {
    key: string;
    value: GridLayoutItem;
  };
}

const DB_NAME = "generous-db";
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<GenerousDB>> | null = null;

function getDB(): Promise<IDBPDatabase<GenerousDB>> {
  if (!dbPromise) {
    dbPromise = openDB<GenerousDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Chat history store
        if (!db.objectStoreNames.contains("chatHistory")) {
          const chatStore = db.createObjectStore("chatHistory", { keyPath: "id" });
          chatStore.createIndex("by-created", "createdAt");
        }

        // Components store
        if (!db.objectStoreNames.contains("components")) {
          const compStore = db.createObjectStore("components", { keyPath: "id" });
          compStore.createIndex("by-created", "createdAt");
        }

        // Grid layout store
        if (!db.objectStoreNames.contains("gridLayout")) {
          db.createObjectStore("gridLayout", { keyPath: "i" });
        }
      },
    });
  }
  return dbPromise;
}

// Chat History operations
export async function saveChatMessage(message: ChatMessage): Promise<void> {
  const db = await getDB();
  await db.put("chatHistory", message);
}

export async function getChatHistory(): Promise<ChatMessage[]> {
  const db = await getDB();
  return db.getAllFromIndex("chatHistory", "by-created");
}

export async function clearChatHistory(): Promise<void> {
  const db = await getDB();
  await db.clear("chatHistory");
}

// Component operations
export async function saveComponent(component: StoredComponent): Promise<void> {
  const db = await getDB();
  await db.put("components", component);
}

export async function getComponents(): Promise<StoredComponent[]> {
  const db = await getDB();
  return db.getAllFromIndex("components", "by-created");
}

export async function deleteComponent(id: string): Promise<void> {
  const db = await getDB();
  await db.delete("components", id);
}

export async function clearComponents(): Promise<void> {
  const db = await getDB();
  await db.clear("components");
}

// Grid Layout operations
export async function saveGridLayout(layout: GridLayoutItem[]): Promise<void> {
  const db = await getDB();
  const tx = db.transaction("gridLayout", "readwrite");
  await tx.store.clear();
  for (const item of layout) {
    await tx.store.put(item);
  }
  await tx.done;
}

export async function getGridLayout(): Promise<GridLayoutItem[]> {
  const db = await getDB();
  return db.getAll("gridLayout");
}

// Full state export/import
export async function exportAppState(): Promise<AppState> {
  const [chatHistory, components, gridLayout] = await Promise.all([
    getChatHistory(),
    getComponents(),
    getGridLayout(),
  ]);
  return { chatHistory, components, gridLayout };
}

export async function importAppState(state: AppState): Promise<void> {
  const db = await getDB();

  // Clear all stores
  await Promise.all([db.clear("chatHistory"), db.clear("components"), db.clear("gridLayout")]);

  // Import chat history
  const chatTx = db.transaction("chatHistory", "readwrite");
  for (const msg of state.chatHistory) {
    await chatTx.store.put(msg);
  }
  await chatTx.done;

  // Import components
  const compTx = db.transaction("components", "readwrite");
  for (const comp of state.components) {
    await compTx.store.put(comp);
  }
  await compTx.done;

  // Import grid layout
  const layoutTx = db.transaction("gridLayout", "readwrite");
  for (const item of state.gridLayout) {
    await layoutTx.store.put(item);
  }
  await layoutTx.done;
}

export async function clearAllData(): Promise<void> {
  const db = await getDB();
  await Promise.all([db.clear("chatHistory"), db.clear("components"), db.clear("gridLayout")]);
}
