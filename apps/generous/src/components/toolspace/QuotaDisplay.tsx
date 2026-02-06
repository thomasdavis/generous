"use client";

import styles from "./QuotaDisplay.module.css";

interface QuotaDisplayProps {
  usage: {
    minute: { count: number };
    hour: { count: number };
    day: { count: number; tokens: number; costCents: number };
  };
  quotas: {
    maxRequestsPerMinute?: number;
    maxRequestsPerHour?: number;
    maxRequestsPerDay?: number;
    maxTokensPerDay?: number;
    maxCostCentsPerDay?: number;
  };
}

function formatPercent(used: number, max: number | undefined): number {
  if (!max) return 0;
  return Math.min(100, Math.round((used / max) * 100));
}

function formatCost(cents: number): string {
  if (cents < 100) {
    return `${cents}¢`;
  }
  return `$${(cents / 100).toFixed(2)}`;
}

export function QuotaDisplay({ usage, quotas }: QuotaDisplayProps) {
  const hasQuotas =
    quotas.maxRequestsPerMinute ||
    quotas.maxRequestsPerHour ||
    quotas.maxRequestsPerDay ||
    quotas.maxTokensPerDay ||
    quotas.maxCostCentsPerDay;

  if (!hasQuotas) {
    return (
      <div className={styles.container}>
        <p className={styles.noQuotas}>No quotas configured</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h4 className={styles.title}>Usage & Quotas</h4>

      {quotas.maxRequestsPerMinute && (
        <div className={styles.quotaItem}>
          <div className={styles.quotaHeader}>
            <span className={styles.quotaLabel}>Per Minute</span>
            <span className={styles.quotaValue}>
              {usage.minute.count} / {quotas.maxRequestsPerMinute}
            </span>
          </div>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{
                width: `${formatPercent(usage.minute.count, quotas.maxRequestsPerMinute)}%`,
              }}
            />
          </div>
        </div>
      )}

      {quotas.maxRequestsPerHour && (
        <div className={styles.quotaItem}>
          <div className={styles.quotaHeader}>
            <span className={styles.quotaLabel}>Per Hour</span>
            <span className={styles.quotaValue}>
              {usage.hour.count} / {quotas.maxRequestsPerHour}
            </span>
          </div>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{
                width: `${formatPercent(usage.hour.count, quotas.maxRequestsPerHour)}%`,
              }}
            />
          </div>
        </div>
      )}

      {quotas.maxRequestsPerDay && (
        <div className={styles.quotaItem}>
          <div className={styles.quotaHeader}>
            <span className={styles.quotaLabel}>Per Day (Requests)</span>
            <span className={styles.quotaValue}>
              {usage.day.count} / {quotas.maxRequestsPerDay}
            </span>
          </div>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{
                width: `${formatPercent(usage.day.count, quotas.maxRequestsPerDay)}%`,
              }}
            />
          </div>
        </div>
      )}

      {quotas.maxTokensPerDay && (
        <div className={styles.quotaItem}>
          <div className={styles.quotaHeader}>
            <span className={styles.quotaLabel}>Per Day (Tokens)</span>
            <span className={styles.quotaValue}>
              {usage.day.tokens.toLocaleString()} / {quotas.maxTokensPerDay.toLocaleString()}
            </span>
          </div>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{
                width: `${formatPercent(usage.day.tokens, quotas.maxTokensPerDay)}%`,
              }}
            />
          </div>
        </div>
      )}

      {quotas.maxCostCentsPerDay && (
        <div className={styles.quotaItem}>
          <div className={styles.quotaHeader}>
            <span className={styles.quotaLabel}>Per Day (Cost)</span>
            <span className={styles.quotaValue}>
              {formatCost(usage.day.costCents)} / {formatCost(quotas.maxCostCentsPerDay)}
            </span>
          </div>
          <div className={styles.progressBar}>
            <div
              className={`${styles.progressFill} ${styles.costFill}`}
              style={{
                width: `${formatPercent(usage.day.costCents, quotas.maxCostCentsPerDay)}%`,
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
