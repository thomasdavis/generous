"use client";

import { Button } from "@generous/ui";
import { useCallback, useEffect, useState } from "react";
import styles from "./VersionHistory.module.css";

interface Version {
  id: string;
  version: number;
  components: unknown[];
  gridLayout: unknown[];
  createdBy?: string;
  createdAt: string;
  comment?: string;
}

interface VersionHistoryProps {
  dashboardId: string;
  onRestore: (version: Version) => Promise<void>;
  onClose: () => void;
}

export function VersionHistory({ dashboardId, onRestore, onClose }: VersionHistoryProps) {
  const [versions, setVersions] = useState<Version[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVersion, setSelectedVersion] = useState<Version | null>(null);
  const [isRestoring, setIsRestoring] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [snapshotComment, setSnapshotComment] = useState("");

  const fetchVersions = useCallback(async () => {
    try {
      const response = await fetch(`/api/dashboards/${dashboardId}/versions`);
      if (response.ok) {
        const data = await response.json();
        setVersions(data.versions);
      } else {
        setError("Failed to load version history");
      }
    } catch (e) {
      setError("Failed to load version history");
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, [dashboardId]);

  useEffect(() => {
    fetchVersions();
  }, [fetchVersions]);

  const handleCreateSnapshot = async () => {
    setIsCreating(true);
    setError(null);

    try {
      const response = await fetch(`/api/dashboards/${dashboardId}/versions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comment: snapshotComment }),
      });

      if (response.ok) {
        const version = await response.json();
        setVersions((prev) => [version, ...prev]);
        setSnapshotComment("");
      } else {
        setError("Failed to create snapshot");
      }
    } catch (e) {
      setError("Failed to create snapshot");
      console.error(e);
    } finally {
      setIsCreating(false);
    }
  };

  const handleRestore = async () => {
    if (!selectedVersion) return;

    setIsRestoring(true);
    setError(null);

    try {
      await onRestore(selectedVersion);
      onClose();
    } catch (e) {
      setError("Failed to restore version");
      console.error(e);
    } finally {
      setIsRestoring(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Version History</h2>
          <button type="button" className={styles.closeButton} onClick={onClose}>
            <svg aria-hidden="true" width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M5 5L15 15M5 15L15 5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        <div className={styles.body}>
          {error && <div className={styles.error}>{error}</div>}

          {/* Create snapshot */}
          <div className={styles.createSection}>
            <h3 className={styles.sectionTitle}>Create Snapshot</h3>
            <div className={styles.createForm}>
              <input
                type="text"
                className={styles.commentInput}
                value={snapshotComment}
                onChange={(e) => setSnapshotComment(e.target.value)}
                placeholder="Optional comment..."
              />
              <Button onClick={handleCreateSnapshot} disabled={isCreating}>
                {isCreating ? "Creating..." : "Save Snapshot"}
              </Button>
            </div>
          </div>

          {/* Version list */}
          <div className={styles.versionSection}>
            <h3 className={styles.sectionTitle}>Previous Versions</h3>

            {isLoading ? (
              <div className={styles.loading}>Loading...</div>
            ) : versions.length === 0 ? (
              <p className={styles.empty}>No previous versions yet.</p>
            ) : (
              <div className={styles.versionList}>
                {versions.map((version) => (
                  <div
                    key={version.id}
                    className={`${styles.versionItem} ${selectedVersion?.id === version.id ? styles.versionSelected : ""}`}
                    onClick={() => setSelectedVersion(version)}
                  >
                    <div className={styles.versionInfo}>
                      <span className={styles.versionNumber}>Version {version.version}</span>
                      <span className={styles.versionDate}>
                        {new Date(version.createdAt).toLocaleString()}
                      </span>
                    </div>
                    {version.comment && <p className={styles.versionComment}>{version.comment}</p>}
                    <div className={styles.versionStats}>
                      <span>{version.components?.length || 0} components</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Selected version details */}
          {selectedVersion && (
            <div className={styles.detailSection}>
              <h3 className={styles.sectionTitle}>Version {selectedVersion.version} Details</h3>
              <div className={styles.detailGrid}>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Created:</span>
                  <span className={styles.detailValue}>
                    {new Date(selectedVersion.createdAt).toLocaleString()}
                  </span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Components:</span>
                  <span className={styles.detailValue}>
                    {selectedVersion.components?.length || 0}
                  </span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Layout items:</span>
                  <span className={styles.detailValue}>
                    {selectedVersion.gridLayout?.length || 0}
                  </span>
                </div>
              </div>
              {selectedVersion.comment && (
                <p className={styles.detailComment}>&ldquo;{selectedVersion.comment}&rdquo;</p>
              )}
            </div>
          )}
        </div>

        <div className={styles.footer}>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          {selectedVersion && (
            <Button onClick={handleRestore} disabled={isRestoring}>
              {isRestoring ? "Restoring..." : "Restore This Version"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
