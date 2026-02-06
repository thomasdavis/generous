"use client";

import { Button, Input } from "@generous/ui";
import { useState } from "react";
import styles from "./ToolspaceConfig.module.css";

interface ToolspaceConfigProps {
  toolspace: {
    id: string;
    name: string;
    tools: string[];
    permissions: {
      allowRead?: boolean;
      allowWrite?: boolean;
      allowDelete?: boolean;
      allowExternalApi?: boolean;
    };
    quotas: {
      maxRequestsPerMinute?: number;
      maxRequestsPerHour?: number;
      maxRequestsPerDay?: number;
      maxTokensPerDay?: number;
      maxCostCentsPerDay?: number;
    };
  };
  onUpdate: (updates: Partial<typeof toolspace>) => Promise<void>;
  onClose: () => void;
}

const TOOL_PATTERN_EXAMPLES = [
  { pattern: "*", description: "Allow all tools" },
  { pattern: "weather", description: "Allow specific tool" },
  { pattern: "@stripe/*", description: "Allow all Stripe tools" },
  { pattern: "@openai/*", description: "Allow all OpenAI tools" },
  { pattern: "get*", description: "Allow read operations" },
];

export function ToolspaceConfig({ toolspace, onUpdate, onClose }: ToolspaceConfigProps) {
  const [name, setName] = useState(toolspace.name);
  const [toolPatterns, setToolPatterns] = useState(toolspace.tools.join("\n"));
  const [permissions, setPermissions] = useState(toolspace.permissions);
  const [quotas, setQuotas] = useState(toolspace.quotas);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);

    try {
      const tools = toolPatterns
        .split("\n")
        .map((p) => p.trim())
        .filter((p) => p.length > 0);

      await onUpdate({
        name,
        tools,
        permissions,
        quotas,
      });

      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setIsSaving(false);
    }
  };

  const updatePermission = (key: keyof typeof permissions, value: boolean) => {
    setPermissions({ ...permissions, [key]: value });
  };

  const updateQuota = (key: keyof typeof quotas, value: string) => {
    const numValue = value === "" ? undefined : parseInt(value, 10);
    setQuotas({ ...quotas, [key]: numValue });
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Toolspace Configuration</h2>
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
              placeholder="Toolspace name"
            />
          </div>

          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Allowed Tools</h3>
            <p className={styles.hint}>Enter one pattern per line. Use * for wildcards.</p>
            <textarea
              className={styles.textarea}
              value={toolPatterns}
              onChange={(e) => setToolPatterns(e.target.value)}
              rows={5}
              placeholder="@stripe/*&#10;weather&#10;calculator"
            />
            <div className={styles.examples}>
              <span className={styles.examplesLabel}>Examples:</span>
              {TOOL_PATTERN_EXAMPLES.map((ex) => (
                <button
                  type="button"
                  key={ex.pattern}
                  className={styles.exampleBtn}
                  onClick={() => setToolPatterns((p) => (p ? `${p}\n${ex.pattern}` : ex.pattern))}
                  title={ex.description}
                >
                  {ex.pattern}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Permissions</h3>
            <div className={styles.checkboxGroup}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={permissions.allowRead !== false}
                  onChange={(e) => updatePermission("allowRead", e.target.checked)}
                />
                <span>Allow Read Operations</span>
              </label>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={permissions.allowWrite !== false}
                  onChange={(e) => updatePermission("allowWrite", e.target.checked)}
                />
                <span>Allow Write Operations</span>
              </label>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={permissions.allowDelete !== false}
                  onChange={(e) => updatePermission("allowDelete", e.target.checked)}
                />
                <span>Allow Delete Operations</span>
              </label>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={permissions.allowExternalApi !== false}
                  onChange={(e) => updatePermission("allowExternalApi", e.target.checked)}
                />
                <span>Allow External API Calls</span>
              </label>
            </div>
          </div>

          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Rate Limits & Quotas</h3>
            <div className={styles.quotaGrid}>
              <div className={styles.quotaField}>
                <label className={styles.quotaLabel}>Max per minute</label>
                <Input
                  type="number"
                  value={quotas.maxRequestsPerMinute ?? ""}
                  onChange={(e) => updateQuota("maxRequestsPerMinute", e.target.value)}
                  placeholder="Unlimited"
                  min={0}
                />
              </div>
              <div className={styles.quotaField}>
                <label className={styles.quotaLabel}>Max per hour</label>
                <Input
                  type="number"
                  value={quotas.maxRequestsPerHour ?? ""}
                  onChange={(e) => updateQuota("maxRequestsPerHour", e.target.value)}
                  placeholder="Unlimited"
                  min={0}
                />
              </div>
              <div className={styles.quotaField}>
                <label className={styles.quotaLabel}>Max per day</label>
                <Input
                  type="number"
                  value={quotas.maxRequestsPerDay ?? ""}
                  onChange={(e) => updateQuota("maxRequestsPerDay", e.target.value)}
                  placeholder="Unlimited"
                  min={0}
                />
              </div>
              <div className={styles.quotaField}>
                <label className={styles.quotaLabel}>Max tokens/day</label>
                <Input
                  type="number"
                  value={quotas.maxTokensPerDay ?? ""}
                  onChange={(e) => updateQuota("maxTokensPerDay", e.target.value)}
                  placeholder="Unlimited"
                  min={0}
                />
              </div>
              <div className={styles.quotaField}>
                <label className={styles.quotaLabel}>Max cost/day (cents)</label>
                <Input
                  type="number"
                  value={quotas.maxCostCentsPerDay ?? ""}
                  onChange={(e) => updateQuota("maxCostCentsPerDay", e.target.value)}
                  placeholder="Unlimited"
                  min={0}
                />
              </div>
            </div>
          </div>
        </div>

        <div className={styles.footer}>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  );
}
