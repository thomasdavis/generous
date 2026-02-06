"use client";

import { Button, Input } from "@generous/ui";
import { useState } from "react";
import styles from "./PublishDialog.module.css";

interface PublishDialogProps {
  dashboardId: string;
  dashboardName: string;
  onPublish: (templateData: {
    name: string;
    description: string;
    category: string;
    tags: string[];
  }) => Promise<void>;
  onClose: () => void;
}

const CATEGORIES = [
  "Analytics",
  "Business",
  "Developer Tools",
  "Finance",
  "Marketing",
  "Productivity",
  "Sales",
  "Support",
  "Other",
];

export function PublishDialog({ dashboardName, onPublish, onClose }: PublishDialogProps) {
  const [name, setName] = useState(dashboardName);
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Other");
  const [tagsInput, setTagsInput] = useState("");
  const [isPublishing, setIsPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePublish = async () => {
    if (!name.trim()) {
      setError("Name is required");
      return;
    }

    if (!description.trim()) {
      setError("Description is required");
      return;
    }

    setIsPublishing(true);
    setError(null);

    try {
      const tags = tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      await onPublish({
        name: name.trim(),
        description: description.trim(),
        category,
        tags,
      });

      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to publish");
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Publish to Marketplace</h2>
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

          <p className={styles.intro}>
            Share your dashboard with the community. Others will be able to install it and create
            their own copy.
          </p>

          <div className={styles.field}>
            <label className={styles.label}>Template Name *</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Amazing Dashboard"
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Description *</label>
            <textarea
              className={styles.textarea}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what this template does and who it's for..."
              rows={4}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Category</label>
            <select
              className={styles.select}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Tags</label>
            <Input
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="dashboard, analytics, api (comma-separated)"
            />
            <p className={styles.hint}>Add tags to help others find your template</p>
          </div>

          <div className={styles.notice}>
            <strong>Note:</strong> Your current dashboard components and layout will be saved as a
            template. Personal data and API keys are not included.
          </div>
        </div>

        <div className={styles.footer}>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handlePublish} disabled={isPublishing}>
            {isPublishing ? "Publishing..." : "Publish Template"}
          </Button>
        </div>
      </div>
    </div>
  );
}
