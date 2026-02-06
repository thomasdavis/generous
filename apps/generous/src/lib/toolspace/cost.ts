/**
 * Cost Calculation and Tracking
 *
 * Estimates and tracks costs for tool executions.
 */

interface CostConfig {
  baseRate: number; // Base cost in cents per execution
  tokenRate: number; // Cost in cents per 1000 tokens
  externalApiMultiplier: number; // Multiplier for external API calls
}

const DEFAULT_COST_CONFIG: CostConfig = {
  baseRate: 0, // Free base
  tokenRate: 0.1, // $0.001 per 1000 tokens
  externalApiMultiplier: 1.5,
};

// Tool-specific cost overrides
const TOOL_COST_OVERRIDES: Record<string, Partial<CostConfig>> = {
  // Registry tools with external APIs
  "@openai/*": { baseRate: 1, tokenRate: 0.5 },
  "@anthropic/*": { baseRate: 1, tokenRate: 0.3 },
  "@stripe/*": { baseRate: 2, externalApiMultiplier: 2 },
  "@twilio/*": { baseRate: 5 },
  "@sendgrid/*": { baseRate: 1 },

  // Free built-in tools
  weather: { baseRate: 0 },
  calculator: { baseRate: 0 },
  timer: { baseRate: 0 },
};

/**
 * Get cost configuration for a tool.
 */
export function getToolCostConfig(toolId: string): CostConfig {
  // Check for exact match
  if (TOOL_COST_OVERRIDES[toolId]) {
    return { ...DEFAULT_COST_CONFIG, ...TOOL_COST_OVERRIDES[toolId] };
  }

  // Check for pattern matches
  for (const [pattern, config] of Object.entries(TOOL_COST_OVERRIDES)) {
    if (pattern.endsWith("/*")) {
      const prefix = pattern.slice(0, -2);
      if (toolId.startsWith(`${prefix}/`)) {
        return { ...DEFAULT_COST_CONFIG, ...config };
      }
    }
  }

  return DEFAULT_COST_CONFIG;
}

/**
 * Calculate cost for a tool execution.
 */
export function calculateCost(
  toolId: string,
  _executionTimeMs: number,
  tokensUsed: number = 0,
  isExternalApi: boolean = false,
): {
  costCents: number;
  breakdown: {
    base: number;
    tokens: number;
    externalMultiplier: number;
  };
} {
  const config = getToolCostConfig(toolId);

  const baseCost = config.baseRate;
  const tokenCost = (tokensUsed / 1000) * config.tokenRate;
  const multiplier = isExternalApi ? config.externalApiMultiplier : 1;

  const totalCost = Math.ceil((baseCost + tokenCost) * multiplier);

  return {
    costCents: totalCost,
    breakdown: {
      base: baseCost,
      tokens: tokenCost,
      externalMultiplier: multiplier,
    },
  };
}

/**
 * Format cost for display.
 */
export function formatCost(costCents: number): string {
  if (costCents === 0) {
    return "Free";
  }
  if (costCents < 100) {
    return `${costCents}¢`;
  }
  return `$${(costCents / 100).toFixed(2)}`;
}

/**
 * Estimate token count from text length (rough approximation).
 */
export function estimateTokens(text: string): number {
  // Rough estimate: ~4 characters per token
  return Math.ceil(text.length / 4);
}

/**
 * Estimate cost before execution (preview).
 */
export function estimateCost(
  toolId: string,
  params: Record<string, unknown>,
): {
  estimatedCostCents: number;
  isExact: boolean;
  note: string;
} {
  const config = getToolCostConfig(toolId);

  // Estimate tokens from params
  const paramsText = JSON.stringify(params);
  const estimatedTokens = estimateTokens(paramsText) * 2; // Input + output estimate

  const { costCents } = calculateCost(toolId, 0, estimatedTokens, toolId.startsWith("@"));

  return {
    estimatedCostCents: costCents,
    isExact: config.baseRate > 0 || config.tokenRate > 0,
    note:
      costCents === 0
        ? "This tool is free to use"
        : `Estimated cost: ${formatCost(costCents)} (actual may vary based on response size)`,
  };
}

/**
 * Aggregate costs for a time period.
 */
export interface CostSummary {
  totalCostCents: number;
  executionCount: number;
  totalTokens: number;
  byTool: Record<string, { count: number; costCents: number }>;
}

export function aggregateCosts(
  usageRecords: Array<{
    toolId: string;
    costCents: number;
    tokensUsed: number;
  }>,
): CostSummary {
  const summary: CostSummary = {
    totalCostCents: 0,
    executionCount: usageRecords.length,
    totalTokens: 0,
    byTool: {},
  };

  for (const record of usageRecords) {
    summary.totalCostCents += record.costCents;
    summary.totalTokens += record.tokensUsed;

    if (!summary.byTool[record.toolId]) {
      summary.byTool[record.toolId] = { count: 0, costCents: 0 };
    }
    summary.byTool[record.toolId].count++;
    summary.byTool[record.toolId].costCents += record.costCents;
  }

  return summary;
}
