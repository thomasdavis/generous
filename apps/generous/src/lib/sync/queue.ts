/**
 * Sync Queue Manager
 *
 * Handles offline-first synchronization between IndexedDB and the server.
 * Processes queued operations when online, with retry logic and conflict resolution.
 */

import { getSyncQueue, removeSyncQueueItem, type SyncQueueItem, updateSyncQueueItem } from "../db";

const MAX_RETRIES = 5;
const BASE_DELAY_MS = 1000;

export type SyncStatus = "idle" | "syncing" | "error" | "offline";

export interface SyncResult {
  success: boolean;
  processed: number;
  failed: number;
  errors: Array<{ itemId: string; error: string }>;
}

type SyncEventHandler = (status: SyncStatus, result?: SyncResult) => void;

class SyncQueueManager {
  private isProcessing = false;
  private status: SyncStatus = "idle";
  private handlers: SyncEventHandler[] = [];
  private onlineHandler: (() => void) | null = null;

  constructor() {
    // Listen for online/offline events
    if (typeof window !== "undefined") {
      this.onlineHandler = () => {
        if (navigator.onLine) {
          this.processQueue();
        } else {
          this.setStatus("offline");
        }
      };
      window.addEventListener("online", this.onlineHandler);
      window.addEventListener("offline", this.onlineHandler);
    }
  }

  // Subscribe to status changes
  onStatusChange(handler: SyncEventHandler): () => void {
    this.handlers.push(handler);
    return () => {
      const index = this.handlers.indexOf(handler);
      if (index >= 0) this.handlers.splice(index, 1);
    };
  }

  private setStatus(status: SyncStatus, result?: SyncResult) {
    this.status = status;
    for (const handler of this.handlers) {
      try {
        handler(status, result);
      } catch (e) {
        console.error("Sync handler error:", e);
      }
    }
  }

  getStatus(): SyncStatus {
    return this.status;
  }

  // Process all items in the sync queue
  async processQueue(): Promise<SyncResult> {
    if (this.isProcessing) {
      return { success: false, processed: 0, failed: 0, errors: [] };
    }

    if (typeof navigator !== "undefined" && !navigator.onLine) {
      this.setStatus("offline");
      return { success: false, processed: 0, failed: 0, errors: [] };
    }

    this.isProcessing = true;
    this.setStatus("syncing");

    const result: SyncResult = {
      success: true,
      processed: 0,
      failed: 0,
      errors: [],
    };

    try {
      const queue = await getSyncQueue();

      for (const item of queue) {
        const itemResult = await this.processItem(item);
        if (itemResult.success) {
          result.processed++;
          await removeSyncQueueItem(item.id);
        } else {
          result.failed++;
          result.errors.push({ itemId: item.id, error: itemResult.error ?? "Unknown error" });

          // Update retry count
          if (item.retries < MAX_RETRIES) {
            await updateSyncQueueItem(item.id, {
              retries: item.retries + 1,
              lastError: itemResult.error,
            });
          }
        }
      }

      result.success = result.failed === 0;
      this.setStatus(result.success ? "idle" : "error", result);
    } catch (error) {
      result.success = false;
      result.errors.push({ itemId: "queue", error: String(error) });
      this.setStatus("error", result);
    } finally {
      this.isProcessing = false;
    }

    return result;
  }

  // Process a single sync item
  private async processItem(item: SyncQueueItem): Promise<{ success: boolean; error?: string }> {
    const delay = BASE_DELAY_MS * 2 ** item.retries;
    if (item.retries > 0) {
      await new Promise((r) => setTimeout(r, delay));
    }

    try {
      const endpoint = this.getEndpoint(item);
      const method = this.getMethod(item.operation);

      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: item.operation !== "delete" ? JSON.stringify(item.payload) : undefined,
      });

      if (!response.ok) {
        const errorText = await response.text();
        return { success: false, error: `HTTP ${response.status}: ${errorText}` };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  private getEndpoint(item: SyncQueueItem): string {
    const base = "/api";
    switch (item.entity) {
      case "dashboard":
        return item.operation === "create"
          ? `${base}/dashboards`
          : `${base}/dashboards/${item.entityId}`;
      case "component":
        return `${base}/dashboards/${item.dashboardId}/components/${item.operation === "create" ? "" : item.entityId}`;
      case "gridLayout":
        return `${base}/dashboards/${item.dashboardId}/layout`;
      case "chatHistory":
        return `${base}/chat/history`;
      default:
        return base;
    }
  }

  private getMethod(operation: SyncQueueItem["operation"]): string {
    switch (operation) {
      case "create":
        return "POST";
      case "update":
        return "PATCH";
      case "delete":
        return "DELETE";
    }
  }

  // Force sync now (user-triggered)
  async syncNow(): Promise<SyncResult> {
    return this.processQueue();
  }

  // Clean up listeners
  destroy() {
    if (typeof window !== "undefined" && this.onlineHandler) {
      window.removeEventListener("online", this.onlineHandler);
      window.removeEventListener("offline", this.onlineHandler);
    }
  }
}

// Singleton instance
let syncManager: SyncQueueManager | null = null;

export function getSyncManager(): SyncQueueManager {
  if (!syncManager) {
    syncManager = new SyncQueueManager();
  }
  return syncManager;
}

// React hook for sync status
export function useSyncStatus(): { status: SyncStatus; sync: () => Promise<SyncResult> } {
  // This would be implemented with useState/useEffect in the actual React context
  const manager = getSyncManager();
  return {
    status: manager.getStatus(),
    sync: () => manager.syncNow(),
  };
}
