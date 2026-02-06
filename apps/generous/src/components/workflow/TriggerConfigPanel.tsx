"use client";

import { Button, Input } from "@generous/ui";
import { useCallback, useEffect, useState } from "react";
import styles from "./TriggerConfigPanel.module.css";

interface TriggerConfigPanelProps {
  workflowId: string;
}

interface Schedule {
  id: string;
  cronExpression: string;
  timezone: string;
  isEnabled: boolean;
  lastRun?: string;
  nextRun?: string;
}

interface WebhookConfig {
  id: string;
  url: string;
  secret: string;
  isEnabled: boolean;
  lastTriggered?: string;
}

const CRON_PRESETS = [
  { label: "Every minute", value: "* * * * *" },
  { label: "Every 5 minutes", value: "*/5 * * * *" },
  { label: "Every 15 minutes", value: "*/15 * * * *" },
  { label: "Every hour", value: "0 * * * *" },
  { label: "Every day at midnight", value: "0 0 * * *" },
  { label: "Every Monday at 9am", value: "0 9 * * 1" },
];

export function TriggerConfigPanel({ workflowId }: TriggerConfigPanelProps) {
  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [webhook, setWebhook] = useState<WebhookConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cronExpression, setCronExpression] = useState("*/5 * * * *");
  const [timezone, setTimezone] = useState("UTC");
  const [isSaving, setIsSaving] = useState(false);
  const [copied, setCopied] = useState<"url" | "secret" | null>(null);

  // Fetch current trigger config
  const fetchConfig = useCallback(async () => {
    try {
      const response = await fetch(`/api/workflows/${workflowId}/schedule`);
      if (response.ok) {
        const data = await response.json();
        setSchedule(data.schedule);
        setWebhook(data.webhook);
        if (data.schedule) {
          setCronExpression(data.schedule.cronExpression);
          setTimezone(data.schedule.timezone);
        }
      }
    } catch (e) {
      setError("Failed to load trigger config");
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, [workflowId]);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  const handleSaveSchedule = async () => {
    setIsSaving(true);
    setError(null);
    try {
      const response = await fetch(`/api/workflows/${workflowId}/schedule`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "cron", cronExpression, timezone }),
      });

      if (response.ok) {
        const data = await response.json();
        setSchedule(data);
      } else {
        setError("Failed to save schedule");
      }
    } catch (e) {
      setError("Failed to save schedule");
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteSchedule = async () => {
    if (!confirm("Remove this schedule?")) return;

    try {
      await fetch(`/api/workflows/${workflowId}/schedule?type=cron`, {
        method: "DELETE",
      });
      setSchedule(null);
    } catch (e) {
      setError("Failed to remove schedule");
      console.error(e);
    }
  };

  const handleCreateWebhook = async () => {
    setIsSaving(true);
    setError(null);
    try {
      const response = await fetch(`/api/workflows/${workflowId}/schedule`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "webhook" }),
      });

      if (response.ok) {
        const data = await response.json();
        setWebhook(data);
      } else {
        setError("Failed to create webhook");
      }
    } catch (e) {
      setError("Failed to create webhook");
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteWebhook = async () => {
    if (!confirm("Delete this webhook?")) return;

    try {
      await fetch(`/api/workflows/${workflowId}/schedule?type=webhook`, {
        method: "DELETE",
      });
      setWebhook(null);
    } catch (e) {
      setError("Failed to delete webhook");
      console.error(e);
    }
  };

  const copyToClipboard = async (text: string, type: "url" | "secret") => {
    await navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const webhookUrl =
    typeof window !== "undefined" && webhook
      ? `${window.location.origin}/api/webhooks/${webhook.url}`
      : webhook
        ? `/api/webhooks/${webhook.url}`
        : "";

  if (isLoading) {
    return <div className={styles.loading}>Loading triggers...</div>;
  }

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Triggers</h3>

      {error && <div className={styles.error}>{error}</div>}

      {/* Scheduled (Cron) Section */}
      <div className={styles.section}>
        <h4 className={styles.sectionTitle}>Scheduled</h4>

        {schedule ? (
          <div className={styles.activeConfig}>
            <div className={styles.configRow}>
              <span className={styles.configLabel}>Schedule:</span>
              <code className={styles.configValue}>{schedule.cronExpression}</code>
            </div>
            {schedule.nextRun && (
              <div className={styles.configRow}>
                <span className={styles.configLabel}>Next run:</span>
                <span className={styles.configValue}>
                  {new Date(schedule.nextRun).toLocaleString()}
                </span>
              </div>
            )}
            {schedule.lastRun && (
              <div className={styles.configRow}>
                <span className={styles.configLabel}>Last run:</span>
                <span className={styles.configValue}>
                  {new Date(schedule.lastRun).toLocaleString()}
                </span>
              </div>
            )}
            <Button variant="ghost" size="sm" onClick={handleDeleteSchedule}>
              Remove Schedule
            </Button>
          </div>
        ) : (
          <div className={styles.configForm}>
            <div className={styles.field}>
              <label className={styles.label}>Preset</label>
              <select
                className={styles.select}
                value={cronExpression}
                onChange={(e) => setCronExpression(e.target.value)}
              >
                {CRON_PRESETS.map((preset) => (
                  <option key={preset.value} value={preset.value}>
                    {preset.label}
                  </option>
                ))}
              </select>
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Cron Expression</label>
              <Input
                value={cronExpression}
                onChange={(e) => setCronExpression(e.target.value)}
                placeholder="* * * * *"
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Timezone</label>
              <Input
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                placeholder="UTC"
              />
            </div>
            <Button onClick={handleSaveSchedule} disabled={isSaving}>
              {isSaving ? "Saving..." : "Enable Schedule"}
            </Button>
          </div>
        )}
      </div>

      {/* Webhook Section */}
      <div className={styles.section}>
        <h4 className={styles.sectionTitle}>Webhook</h4>

        {webhook ? (
          <div className={styles.activeConfig}>
            <div className={styles.configRow}>
              <span className={styles.configLabel}>URL:</span>
              <code className={styles.configValueSmall}>{webhookUrl}</code>
              <button
                type="button"
                className={styles.copyBtn}
                onClick={() => copyToClipboard(webhookUrl, "url")}
              >
                {copied === "url" ? "Copied!" : "Copy"}
              </button>
            </div>
            <div className={styles.configRow}>
              <span className={styles.configLabel}>Secret:</span>
              <code className={styles.configValueSmall}>{webhook.secret.slice(0, 8)}...</code>
              <button
                type="button"
                className={styles.copyBtn}
                onClick={() => copyToClipboard(webhook.secret, "secret")}
              >
                {copied === "secret" ? "Copied!" : "Copy"}
              </button>
            </div>
            {webhook.lastTriggered && (
              <div className={styles.configRow}>
                <span className={styles.configLabel}>Last triggered:</span>
                <span className={styles.configValue}>
                  {new Date(webhook.lastTriggered).toLocaleString()}
                </span>
              </div>
            )}
            <div className={styles.hint}>
              Send POST requests to the webhook URL. Include <code>x-webhook-signature</code> header
              with HMAC-SHA256 signature for security.
            </div>
            <Button variant="ghost" size="sm" onClick={handleDeleteWebhook}>
              Delete Webhook
            </Button>
          </div>
        ) : (
          <div className={styles.configForm}>
            <p className={styles.description}>
              Create a webhook URL to trigger this workflow from external services.
            </p>
            <Button onClick={handleCreateWebhook} disabled={isSaving}>
              {isSaving ? "Creating..." : "Create Webhook"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
