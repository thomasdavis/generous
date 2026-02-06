"use client";

import { Button, Input } from "@generous/ui";
import { useState } from "react";
import styles from "./DashboardSettings.module.css";

interface DashboardSettingsProps {
  dashboard: {
    id: string;
    slug: string;
    name: string;
    description?: string;
    isPublic: boolean;
    role: string;
  };
  onUpdate: (
    updates: Partial<{
      name: string;
      slug: string;
      description: string;
      isPublic: boolean;
    }>,
  ) => Promise<void>;
  onClose: () => void;
}

export function DashboardSettings({ dashboard, onUpdate, onClose }: DashboardSettingsProps) {
  const [name, setName] = useState(dashboard.name);
  const [slug, setSlug] = useState(dashboard.slug);
  const [description, setDescription] = useState(dashboard.description || "");
  const [isPublic, setIsPublic] = useState(dashboard.isPublic);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isOwner = dashboard.role === "owner";
  const canEdit = isOwner || dashboard.role === "admin" || dashboard.role === "editor";

  const handleSave = async () => {
    if (!canEdit) return;

    setIsSaving(true);
    setError(null);

    try {
      const updates: Record<string, unknown> = {};

      if (name !== dashboard.name) updates.name = name;
      if (description !== dashboard.description) updates.description = description;

      // Only owner can change these
      if (isOwner) {
        if (slug !== dashboard.slug) updates.slug = slug;
        if (isPublic !== dashboard.isPublic) updates.isPublic = isPublic;
      }

      if (Object.keys(updates).length > 0) {
        await onUpdate(updates as Parameters<typeof onUpdate>[0]);
      }

      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save changes");
    } finally {
      setIsSaving(false);
    }
  };

  const publicUrl =
    typeof window !== "undefined" ? `${window.location.origin}/d/${slug}` : `/d/${slug}`;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Dashboard Settings</h2>
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

          <div className={styles.field}>
            <label className={styles.label}>Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Dashboard name"
              disabled={!canEdit}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Description</label>
            <textarea
              className={styles.textarea}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description..."
              disabled={!canEdit}
              rows={3}
            />
          </div>

          {isOwner && (
            <>
              <div className={styles.field}>
                <label className={styles.label}>URL Slug</label>
                <Input
                  value={slug}
                  onChange={(e) =>
                    setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))
                  }
                  placeholder="my-dashboard"
                />
                <p className={styles.hint}>
                  Used in the public URL: <code>/d/{slug}</code>
                </p>
              </div>

              <div className={styles.field}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={isPublic}
                    onChange={(e) => setIsPublic(e.target.checked)}
                    className={styles.checkbox}
                  />
                  <span>Make this dashboard public</span>
                </label>
                {isPublic && (
                  <div className={styles.publicUrl}>
                    <span className={styles.urlLabel}>Public URL:</span>
                    <code className={styles.urlCode}>{publicUrl}</code>
                    <button
                      type="button"
                      className={styles.copyButton}
                      onClick={() => navigator.clipboard.writeText(publicUrl)}
                    >
                      Copy
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <div className={styles.footer}>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          {canEdit && (
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
