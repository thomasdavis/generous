"use client";

import { Button, Input } from "@generous/ui";
import { useCallback, useEffect, useState } from "react";
import styles from "./DashboardSelector.module.css";

interface Dashboard {
  id: string;
  slug: string;
  name: string;
  description?: string;
  isPublic: boolean;
  role: string;
  updatedAt: string;
}

interface DashboardSelectorProps {
  currentDashboardId: string | null;
  onSelect: (dashboardId: string | null) => void;
  onCreateNew: (name: string) => Promise<Dashboard>;
}

export function DashboardSelector({
  currentDashboardId,
  onSelect,
  onCreateNew,
}: DashboardSelectorProps) {
  const [dashboards, setDashboards] = useState<Dashboard[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboards = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/dashboards");
      if (response.ok) {
        const data = await response.json();
        setDashboards(data.dashboards);
      } else if (response.status === 401) {
        // Not logged in, use local-only mode
        setDashboards([]);
      }
    } catch (e) {
      setError("Failed to load dashboards");
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboards();
  }, [fetchDashboards]);

  const handleCreate = async () => {
    if (!newName.trim()) return;

    try {
      const dashboard = await onCreateNew(newName.trim());
      setDashboards((prev) => [...prev, dashboard]);
      setNewName("");
      setIsCreating(false);
      onSelect(dashboard.id);
    } catch (e) {
      setError("Failed to create dashboard");
      console.error(e);
    }
  };

  const currentDashboard = dashboards.find((d) => d.id === currentDashboardId);

  return (
    <div className={styles.container}>
      <button
        type="button"
        className={styles.trigger}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <span className={styles.label}>{currentDashboard?.name || "Local Dashboard"}</span>
        <svg
          aria-hidden="true"
          className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ""}`}
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
        >
          <path
            d="M2.5 4.5L6 8L9.5 4.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {isOpen && (
        <div className={styles.dropdown}>
          {isLoading ? (
            <div className={styles.loading}>Loading...</div>
          ) : error ? (
            <div className={styles.error}>{error}</div>
          ) : (
            <>
              {/* Local dashboard option */}
              <button
                type="button"
                className={`${styles.option} ${!currentDashboardId ? styles.optionActive : ""}`}
                onClick={() => {
                  onSelect(null);
                  setIsOpen(false);
                }}
              >
                <span className={styles.optionName}>Local Dashboard</span>
                <span className={styles.optionBadge}>Device Only</span>
              </button>

              {dashboards.length > 0 && <div className={styles.divider} />}

              {/* Server dashboards */}
              {dashboards.map((dashboard) => (
                <button
                  type="button"
                  key={dashboard.id}
                  className={`${styles.option} ${dashboard.id === currentDashboardId ? styles.optionActive : ""}`}
                  onClick={() => {
                    onSelect(dashboard.id);
                    setIsOpen(false);
                  }}
                >
                  <span className={styles.optionName}>{dashboard.name}</span>
                  <span className={styles.optionMeta}>
                    {dashboard.isPublic && <span className={styles.publicBadge}>Public</span>}
                    <span className={styles.roleBadge}>{dashboard.role}</span>
                  </span>
                </button>
              ))}

              <div className={styles.divider} />

              {/* Create new */}
              {isCreating ? (
                <div className={styles.createForm}>
                  <Input
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Dashboard name"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleCreate();
                      if (e.key === "Escape") setIsCreating(false);
                    }}
                  />
                  <div className={styles.createActions}>
                    <Button size="sm" onClick={handleCreate}>
                      Create
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setIsCreating(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  className={styles.createButton}
                  onClick={() => setIsCreating(true)}
                >
                  <svg aria-hidden="true" width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path
                      d="M7 2V12M2 7H12"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                  New Dashboard
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
