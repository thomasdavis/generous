/**
 * Quota Management for Toolspace
 *
 * Tracks and enforces usage limits for tool executions.
 */

interface QuotaConfig {
  maxRequestsPerMinute?: number;
  maxRequestsPerHour?: number;
  maxRequestsPerDay?: number;
  maxTokensPerDay?: number;
  maxCostCentsPerDay?: number;
}

interface UsageRecord {
  count: number;
  tokens: number;
  costCents: number;
  firstRequestAt: number;
}

// In-memory usage tracking (in production, use Redis or database)
const usageByPeriod: Map<string, UsageRecord> = new Map();

function getUsageKey(
  userId: string,
  toolspaceId: string,
  period: "minute" | "hour" | "day",
): string {
  const now = new Date();
  let periodKey: string;

  switch (period) {
    case "minute":
      periodKey = `${now.getUTCFullYear()}-${now.getUTCMonth()}-${now.getUTCDate()}-${now.getUTCHours()}-${now.getUTCMinutes()}`;
      break;
    case "hour":
      periodKey = `${now.getUTCFullYear()}-${now.getUTCMonth()}-${now.getUTCDate()}-${now.getUTCHours()}`;
      break;
    case "day":
      periodKey = `${now.getUTCFullYear()}-${now.getUTCMonth()}-${now.getUTCDate()}`;
      break;
  }

  return `${userId}:${toolspaceId}:${period}:${periodKey}`;
}

function getUsage(key: string): UsageRecord {
  const existing = usageByPeriod.get(key);
  if (existing) {
    return existing;
  }
  return { count: 0, tokens: 0, costCents: 0, firstRequestAt: Date.now() };
}

function setUsage(key: string, record: UsageRecord): void {
  usageByPeriod.set(key, record);

  // Clean up old entries (older than 25 hours)
  const cutoff = Date.now() - 25 * 60 * 60 * 1000;
  for (const [k, v] of usageByPeriod.entries()) {
    if (v.firstRequestAt < cutoff) {
      usageByPeriod.delete(k);
    }
  }
}

/**
 * Check if a request would exceed quotas.
 * Returns error message if quota exceeded, null if allowed.
 */
export function checkQuota(
  userId: string,
  toolspaceId: string,
  quotas: QuotaConfig,
): string | null {
  // Check per-minute limit
  if (quotas.maxRequestsPerMinute) {
    const key = getUsageKey(userId, toolspaceId, "minute");
    const usage = getUsage(key);
    if (usage.count >= quotas.maxRequestsPerMinute) {
      return `Rate limit exceeded: ${quotas.maxRequestsPerMinute} requests per minute`;
    }
  }

  // Check per-hour limit
  if (quotas.maxRequestsPerHour) {
    const key = getUsageKey(userId, toolspaceId, "hour");
    const usage = getUsage(key);
    if (usage.count >= quotas.maxRequestsPerHour) {
      return `Rate limit exceeded: ${quotas.maxRequestsPerHour} requests per hour`;
    }
  }

  // Check per-day limit
  if (quotas.maxRequestsPerDay) {
    const key = getUsageKey(userId, toolspaceId, "day");
    const usage = getUsage(key);
    if (usage.count >= quotas.maxRequestsPerDay) {
      return `Daily limit exceeded: ${quotas.maxRequestsPerDay} requests per day`;
    }
  }

  // Check token limit
  if (quotas.maxTokensPerDay) {
    const key = getUsageKey(userId, toolspaceId, "day");
    const usage = getUsage(key);
    if (usage.tokens >= quotas.maxTokensPerDay) {
      return `Token limit exceeded: ${quotas.maxTokensPerDay} tokens per day`;
    }
  }

  // Check cost limit
  if (quotas.maxCostCentsPerDay) {
    const key = getUsageKey(userId, toolspaceId, "day");
    const usage = getUsage(key);
    if (usage.costCents >= quotas.maxCostCentsPerDay) {
      return `Cost limit exceeded: $${(quotas.maxCostCentsPerDay / 100).toFixed(2)} per day`;
    }
  }

  return null;
}

/**
 * Record a tool execution for quota tracking.
 */
export function recordUsage(
  userId: string,
  toolspaceId: string,
  tokens: number = 0,
  costCents: number = 0,
): void {
  // Update all period buckets
  for (const period of ["minute", "hour", "day"] as const) {
    const key = getUsageKey(userId, toolspaceId, period);
    const usage = getUsage(key);
    usage.count++;
    usage.tokens += tokens;
    usage.costCents += costCents;
    setUsage(key, usage);
  }
}

/**
 * Get current usage stats for a user/toolspace.
 */
export function getUsageStats(
  userId: string,
  toolspaceId: string,
): {
  minute: UsageRecord;
  hour: UsageRecord;
  day: UsageRecord;
} {
  return {
    minute: getUsage(getUsageKey(userId, toolspaceId, "minute")),
    hour: getUsage(getUsageKey(userId, toolspaceId, "hour")),
    day: getUsage(getUsageKey(userId, toolspaceId, "day")),
  };
}

/**
 * Reset usage for a user/toolspace (admin function).
 */
export function resetUsage(userId: string, toolspaceId: string): void {
  for (const period of ["minute", "hour", "day"] as const) {
    const key = getUsageKey(userId, toolspaceId, period);
    usageByPeriod.delete(key);
  }
}

/**
 * Get remaining quota for display.
 */
export function getRemainingQuota(
  userId: string,
  toolspaceId: string,
  quotas: QuotaConfig,
): {
  requestsPerMinute: number | null;
  requestsPerHour: number | null;
  requestsPerDay: number | null;
  tokensPerDay: number | null;
  costCentsPerDay: number | null;
} {
  const stats = getUsageStats(userId, toolspaceId);

  return {
    requestsPerMinute: quotas.maxRequestsPerMinute
      ? Math.max(0, quotas.maxRequestsPerMinute - stats.minute.count)
      : null,
    requestsPerHour: quotas.maxRequestsPerHour
      ? Math.max(0, quotas.maxRequestsPerHour - stats.hour.count)
      : null,
    requestsPerDay: quotas.maxRequestsPerDay
      ? Math.max(0, quotas.maxRequestsPerDay - stats.day.count)
      : null,
    tokensPerDay: quotas.maxTokensPerDay
      ? Math.max(0, quotas.maxTokensPerDay - stats.day.tokens)
      : null,
    costCentsPerDay: quotas.maxCostCentsPerDay
      ? Math.max(0, quotas.maxCostCentsPerDay - stats.day.costCents)
      : null,
  };
}
