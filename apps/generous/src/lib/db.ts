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

// Local dashboard for offline-first support
export interface LocalDashboard {
  id: string;
  slug: string;
  name: string;
  description?: string;
  isPublic: boolean;
  components: StoredComponent[];
  gridLayout: GridLayoutItem[];
  settings: Record<string, unknown>;
  syncedAt?: number; // Last sync with server
  isDirty: boolean; // Has local changes not synced
  createdAt: number;
  updatedAt: number;
}

// Sync queue item for offline-first sync
export interface SyncQueueItem {
  id: string;
  operation: "create" | "update" | "delete";
  entity: "dashboard" | "component" | "gridLayout" | "chatHistory";
  entityId: string;
  dashboardId?: string;
  payload: unknown;
  createdAt: number;
  retries: number;
  lastError?: string;
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
    indexes: { "by-created": number; "by-dashboard": string };
  };
  gridLayout: {
    key: string;
    value: GridLayoutItem & { dashboardId?: string };
    indexes: { "by-dashboard": string };
  };
  localDashboards: {
    key: string;
    value: LocalDashboard;
    indexes: { "by-slug": string; "by-updated": number };
  };
  syncQueue: {
    key: string;
    value: SyncQueueItem;
    indexes: { "by-created": number; "by-entity": string };
  };
  activeDashboard: {
    key: string;
    value: { id: string; dashboardId: string | null };
  };
}

const DB_NAME = "generous-db";
const DB_VERSION = 2;

let dbPromise: Promise<IDBPDatabase<GenerousDB>> | null = null;

function getDB(): Promise<IDBPDatabase<GenerousDB>> {
  if (!dbPromise) {
    dbPromise = openDB<GenerousDB>(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion, _newVersion, transaction) {
        // Chat history store
        if (!db.objectStoreNames.contains("chatHistory")) {
          const chatStore = db.createObjectStore("chatHistory", { keyPath: "id" });
          chatStore.createIndex("by-created", "createdAt");
        }

        // Components store
        if (!db.objectStoreNames.contains("components")) {
          const compStore = db.createObjectStore("components", { keyPath: "id" });
          compStore.createIndex("by-created", "createdAt");
          compStore.createIndex("by-dashboard", "dashboardId");
        } else if (oldVersion < 2) {
          // Add dashboard index to existing components store
          const compStore = transaction.objectStore("components");
          if (!compStore.indexNames.contains("by-dashboard")) {
            compStore.createIndex("by-dashboard", "dashboardId");
          }
        }

        // Grid layout store
        if (!db.objectStoreNames.contains("gridLayout")) {
          const layoutStore = db.createObjectStore("gridLayout", { keyPath: "i" });
          layoutStore.createIndex("by-dashboard", "dashboardId");
        } else if (oldVersion < 2) {
          const layoutStore = transaction.objectStore("gridLayout");
          if (!layoutStore.indexNames.contains("by-dashboard")) {
            layoutStore.createIndex("by-dashboard", "dashboardId");
          }
        }

        // V2: Local dashboards store (new in v2)
        if (!db.objectStoreNames.contains("localDashboards")) {
          const dashStore = db.createObjectStore("localDashboards", { keyPath: "id" });
          dashStore.createIndex("by-slug", "slug", { unique: true });
          dashStore.createIndex("by-updated", "updatedAt");
        }

        // V2: Sync queue store (new in v2)
        if (!db.objectStoreNames.contains("syncQueue")) {
          const syncStore = db.createObjectStore("syncQueue", { keyPath: "id" });
          syncStore.createIndex("by-created", "createdAt");
          syncStore.createIndex("by-entity", "entity");
        }

        // V2: Active dashboard reference (new in v2)
        if (!db.objectStoreNames.contains("activeDashboard")) {
          db.createObjectStore("activeDashboard", { keyPath: "id" });
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

// Get recent chat messages (newest first, with pagination)
export async function getRecentChatHistory(
  limit: number,
  beforeTimestamp?: number,
): Promise<ChatMessage[]> {
  const db = await getDB();
  const tx = db.transaction("chatHistory", "readonly");
  const index = tx.store.index("by-created");

  const messages: ChatMessage[] = [];

  // Use a cursor to iterate in reverse order (newest first)
  const range = beforeTimestamp ? IDBKeyRange.upperBound(beforeTimestamp, true) : undefined;

  let cursor = await index.openCursor(range, "prev");

  while (cursor && messages.length < limit) {
    messages.push(cursor.value);
    cursor = await cursor.continue();
  }

  // Reverse to get chronological order for display
  return messages.reverse();
}

// Get total count of chat messages
export async function getChatMessageCount(): Promise<number> {
  const db = await getDB();
  return db.count("chatHistory");
}

// Save multiple chat messages at once
export async function saveChatMessages(messages: ChatMessage[]): Promise<void> {
  const db = await getDB();
  const tx = db.transaction("chatHistory", "readwrite");
  for (const msg of messages) {
    await tx.store.put(msg);
  }
  await tx.done;
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

// ============================================
// Local Dashboard operations (v2)
// ============================================

export async function saveLocalDashboard(dashboard: LocalDashboard): Promise<void> {
  const db = await getDB();
  await db.put("localDashboards", dashboard);
}

export async function getLocalDashboard(id: string): Promise<LocalDashboard | undefined> {
  const db = await getDB();
  return db.get("localDashboards", id);
}

export async function getLocalDashboardBySlug(slug: string): Promise<LocalDashboard | undefined> {
  const db = await getDB();
  return db.getFromIndex("localDashboards", "by-slug", slug);
}

export async function getLocalDashboards(): Promise<LocalDashboard[]> {
  const db = await getDB();
  return db.getAllFromIndex("localDashboards", "by-updated");
}

export async function deleteLocalDashboard(id: string): Promise<void> {
  const db = await getDB();
  await db.delete("localDashboards", id);
}

export async function setActiveDashboard(dashboardId: string | null): Promise<void> {
  const db = await getDB();
  await db.put("activeDashboard", { id: "current", dashboardId });
}

export async function getActiveDashboard(): Promise<string | null> {
  const db = await getDB();
  const record = await db.get("activeDashboard", "current");
  return record?.dashboardId ?? null;
}

// ============================================
// Sync Queue operations (v2)
// ============================================

export async function addToSyncQueue(
  item: Omit<SyncQueueItem, "id" | "createdAt" | "retries">,
): Promise<SyncQueueItem> {
  const db = await getDB();
  const fullItem: SyncQueueItem = {
    ...item,
    id: crypto.randomUUID(),
    createdAt: Date.now(),
    retries: 0,
  };
  await db.put("syncQueue", fullItem);
  return fullItem;
}

export async function getSyncQueue(): Promise<SyncQueueItem[]> {
  const db = await getDB();
  return db.getAllFromIndex("syncQueue", "by-created");
}

export async function getSyncQueueByEntity(
  entity: SyncQueueItem["entity"],
): Promise<SyncQueueItem[]> {
  const db = await getDB();
  return db.getAllFromIndex("syncQueue", "by-entity", entity);
}

export async function updateSyncQueueItem(
  id: string,
  updates: Partial<SyncQueueItem>,
): Promise<void> {
  const db = await getDB();
  const item = await db.get("syncQueue", id);
  if (item) {
    await db.put("syncQueue", { ...item, ...updates });
  }
}

export async function removeSyncQueueItem(id: string): Promise<void> {
  const db = await getDB();
  await db.delete("syncQueue", id);
}

export async function clearSyncQueue(): Promise<void> {
  const db = await getDB();
  await db.clear("syncQueue");
}

// ============================================
// Dashboard-scoped component operations (v2)
// ============================================

export async function getComponentsByDashboard(dashboardId: string): Promise<StoredComponent[]> {
  const db = await getDB();
  const all = await db.getAll("components");
  // Filter by dashboardId (stored as extra field)
  return all.filter(
    (c) => (c as StoredComponent & { dashboardId?: string }).dashboardId === dashboardId,
  );
}

export async function getGridLayoutByDashboard(dashboardId: string): Promise<GridLayoutItem[]> {
  const db = await getDB();
  const all = await db.getAll("gridLayout");
  return all
    .filter((item) => item.dashboardId === dashboardId)
    .map(({ dashboardId: _, ...item }) => item);
}

export async function saveComponentWithDashboard(
  component: StoredComponent,
  dashboardId: string,
): Promise<void> {
  const db = await getDB();
  await db.put("components", { ...component, dashboardId } as StoredComponent & {
    dashboardId: string;
  });
}

export async function saveGridLayoutWithDashboard(
  layout: GridLayoutItem[],
  dashboardId: string,
): Promise<void> {
  const db = await getDB();
  const tx = db.transaction("gridLayout", "readwrite");
  // Clear existing layout for this dashboard
  const all = await tx.store.getAll();
  for (const item of all) {
    if (item.dashboardId === dashboardId) {
      await tx.store.delete(item.i);
    }
  }
  // Save new layout
  for (const item of layout) {
    await tx.store.put({ ...item, dashboardId });
  }
  await tx.done;
}

// ============================================
// Full state export/import with dashboards (v2)
// ============================================

export interface AppStateV2 {
  version: 2;
  activeDashboardId: string | null;
  dashboards: LocalDashboard[];
  chatHistory: ChatMessage[];
}

export async function exportAppStateV2(): Promise<AppStateV2> {
  const [activeDashboardId, dashboards, chatHistory] = await Promise.all([
    getActiveDashboard(),
    getLocalDashboards(),
    getChatHistory(),
  ]);
  return {
    version: 2,
    activeDashboardId,
    dashboards,
    chatHistory,
  };
}

export async function importAppStateV2(state: AppStateV2): Promise<void> {
  const db = await getDB();

  // Clear all stores
  await Promise.all([
    db.clear("chatHistory"),
    db.clear("components"),
    db.clear("gridLayout"),
    db.clear("localDashboards"),
    db.clear("syncQueue"),
    db.clear("activeDashboard"),
  ]);

  // Import dashboards
  const dashTx = db.transaction("localDashboards", "readwrite");
  for (const dash of state.dashboards) {
    await dashTx.store.put(dash);
  }
  await dashTx.done;

  // Import chat history
  const chatTx = db.transaction("chatHistory", "readwrite");
  for (const msg of state.chatHistory) {
    await chatTx.store.put(msg);
  }
  await chatTx.done;

  // Set active dashboard
  if (state.activeDashboardId) {
    await setActiveDashboard(state.activeDashboardId);
  }
}
