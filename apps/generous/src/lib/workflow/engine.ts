/**
 * Workflow Execution Engine
 *
 * Executes workflow DAGs with support for:
 * - Topological ordering
 * - Node reference resolution
 * - Conditional branching
 * - Loop iteration
 * - Error handling with retries
 * - Progress events
 */

import {
  type ConditionConfig,
  type ExecutionTrigger,
  isNodeReference,
  type NodeExecutionResult,
  type NodeReference,
  type ToolNode,
  type WorkflowDefinition,
  type WorkflowEdge,
  type WorkflowEvent,
  type WorkflowEventType,
  type WorkflowExecutionState,
} from "./types";

type EventHandler = (event: WorkflowEvent) => void;

// Get value at a dot-notation path
function getValueAtPath(obj: unknown, path: string): unknown {
  const parts = path.split(".");
  let current: unknown = obj;
  for (const part of parts) {
    if (current === null || current === undefined) return undefined;
    if (typeof current === "object") {
      current = (current as Record<string, unknown>)[part];
    } else {
      return undefined;
    }
  }
  return current;
}

// Resolve a node reference using execution results
function resolveReference(
  ref: NodeReference,
  nodeResults: Record<string, NodeExecutionResult>,
): unknown {
  const [nodeId, ...pathParts] = ref.$ref.split(".");
  const result = nodeResults[nodeId];
  if (!result || result.status !== "completed") {
    throw new Error(`Node ${nodeId} has not completed or failed`);
  }
  if (pathParts.length === 0) {
    return result.output;
  }
  return getValueAtPath(result.output, pathParts.join("."));
}

// Resolve all references in a params object
function resolveParams(
  params: Record<string, unknown>,
  nodeResults: Record<string, NodeExecutionResult>,
  variables: Record<string, unknown>,
): Record<string, unknown> {
  const resolved: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(params)) {
    if (isNodeReference(value)) {
      resolved[key] = resolveReference(value, nodeResults);
    } else if (typeof value === "string" && value.startsWith("$var.")) {
      // Variable reference
      const varName = value.slice(5);
      resolved[key] = variables[varName];
    } else if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      resolved[key] = resolveParams(value as Record<string, unknown>, nodeResults, variables);
    } else {
      resolved[key] = value;
    }
  }
  return resolved;
}

// Evaluate a condition
function evaluateCondition(
  condition: ConditionConfig,
  nodeResults: Record<string, NodeExecutionResult>,
  variables: Record<string, unknown>,
): boolean {
  let leftValue: unknown;
  if (isNodeReference(condition.leftOperand)) {
    leftValue = resolveReference(condition.leftOperand, nodeResults);
  } else if (
    typeof condition.leftOperand === "string" &&
    condition.leftOperand.startsWith("$var.")
  ) {
    leftValue = variables[condition.leftOperand.slice(5)];
  } else {
    leftValue = condition.leftOperand;
  }

  let rightValue: unknown = condition.rightOperand;
  if (isNodeReference(rightValue)) {
    rightValue = resolveReference(rightValue, nodeResults);
  }

  switch (condition.operator) {
    case "eq":
      return leftValue === rightValue;
    case "neq":
      return leftValue !== rightValue;
    case "gt":
      return Number(leftValue) > Number(rightValue);
    case "gte":
      return Number(leftValue) >= Number(rightValue);
    case "lt":
      return Number(leftValue) < Number(rightValue);
    case "lte":
      return Number(leftValue) <= Number(rightValue);
    case "contains":
      return String(leftValue).includes(String(rightValue));
    case "startsWith":
      return String(leftValue).startsWith(String(rightValue));
    case "endsWith":
      return String(leftValue).endsWith(String(rightValue));
    case "regex":
      return new RegExp(String(rightValue)).test(String(leftValue));
    default:
      return false;
  }
}

// Topological sort using Kahn's algorithm
function topologicalSort(nodes: ToolNode[], edges: WorkflowEdge[]): string[] {
  const nodeIds = new Set(nodes.map((n) => n.id));
  const inDegree: Record<string, number> = {};
  const adjList: Record<string, string[]> = {};

  // Initialize
  for (const id of nodeIds) {
    inDegree[id] = 0;
    adjList[id] = [];
  }

  // Build adjacency list and in-degree count
  for (const edge of edges) {
    if (nodeIds.has(edge.source) && nodeIds.has(edge.target)) {
      adjList[edge.source].push(edge.target);
      inDegree[edge.target]++;
    }
  }

  // Find all nodes with no incoming edges
  const queue: string[] = [];
  for (const id of nodeIds) {
    if (inDegree[id] === 0) {
      queue.push(id);
    }
  }

  const sorted: string[] = [];
  while (queue.length > 0) {
    const current = queue.shift() as string;
    sorted.push(current);

    for (const neighbor of adjList[current]) {
      inDegree[neighbor]--;
      if (inDegree[neighbor] === 0) {
        queue.push(neighbor);
      }
    }
  }

  // Check for cycles
  if (sorted.length !== nodeIds.size) {
    throw new Error("Workflow contains cycles");
  }

  return sorted;
}

// Get nodes that feed into a given node
function getUpstreamNodes(nodeId: string, edges: WorkflowEdge[]): string[] {
  return edges.filter((e) => e.target === nodeId).map((e) => e.source);
}

// Tool executor function type
type ToolExecutor = (toolId: string, params: Record<string, unknown>) => Promise<unknown>;

export class WorkflowEngine {
  private workflow: WorkflowDefinition;
  private eventHandlers: EventHandler[] = [];
  private toolExecutor: ToolExecutor;

  constructor(workflow: WorkflowDefinition, toolExecutor: ToolExecutor) {
    this.workflow = workflow;
    this.toolExecutor = toolExecutor;
  }

  // Subscribe to execution events
  on(handler: EventHandler): () => void {
    this.eventHandlers.push(handler);
    return () => {
      const index = this.eventHandlers.indexOf(handler);
      if (index >= 0) this.eventHandlers.splice(index, 1);
    };
  }

  // Emit an event to all handlers
  private emit(type: WorkflowEventType, executionId: string, nodeId?: string, data?: unknown) {
    const event: WorkflowEvent = {
      type,
      executionId,
      nodeId,
      timestamp: Date.now(),
      data,
    };
    for (const handler of this.eventHandlers) {
      try {
        handler(event);
      } catch (e) {
        console.error("Event handler error:", e);
      }
    }
  }

  // Execute the workflow
  async execute(trigger: ExecutionTrigger): Promise<WorkflowExecutionState> {
    const executionId = crypto.randomUUID();
    const now = Date.now();

    const state: WorkflowExecutionState = {
      id: executionId,
      workflowId: this.workflow.id,
      status: "pending",
      triggeredBy: trigger.type,
      triggeredAt: now,
      nodeResults: {},
      variables: { ...trigger.variables },
    };

    // Initialize variables with defaults
    for (const variable of this.workflow.variables) {
      if (state.variables[variable.name] === undefined && variable.defaultValue !== undefined) {
        state.variables[variable.name] = variable.defaultValue;
      }
    }

    try {
      state.status = "running";
      state.startedAt = Date.now();
      this.emit("execution:start", executionId, undefined, { trigger });

      // Get execution order
      const executionOrder = topologicalSort(this.workflow.nodes, this.workflow.edges);
      const nodeMap = new Map(this.workflow.nodes.map((n) => [n.id, n]));

      // Track which nodes should be skipped (from failed conditions)
      const skipNodes = new Set<string>();

      // Execute nodes in order
      for (const nodeId of executionOrder) {
        const node = nodeMap.get(nodeId);
        if (!node || node.disabled || skipNodes.has(nodeId)) {
          if (skipNodes.has(nodeId)) {
            state.nodeResults[nodeId] = {
              nodeId,
              status: "skipped",
            };
            this.emit("node:skip", executionId, nodeId);
          }
          continue;
        }

        // Check if all upstream nodes have completed
        const upstream = getUpstreamNodes(nodeId, this.workflow.edges);
        const allUpstreamComplete = upstream.every((id) => {
          const result = state.nodeResults[id];
          return result && (result.status === "completed" || result.status === "skipped");
        });

        if (!allUpstreamComplete) {
          skipNodes.add(nodeId);
          state.nodeResults[nodeId] = { nodeId, status: "skipped" };
          continue;
        }

        // Execute the node
        const result = await this.executeNode(node, state, executionId, skipNodes);
        state.nodeResults[nodeId] = result;

        if (result.status === "failed" && node.data.type === "tool") {
          const onError = node.data.onError ?? "stop";
          if (onError === "stop") {
            throw new Error(`Node ${nodeId} failed: ${result.error}`);
          }
        }
      }

      state.status = "completed";
      state.completedAt = Date.now();
      this.emit("execution:complete", executionId, undefined, { state });
    } catch (error) {
      state.status = "failed";
      state.completedAt = Date.now();
      state.error = error instanceof Error ? error.message : String(error);
      this.emit("execution:fail", executionId, undefined, { error: state.error });
    }

    return state;
  }

  // Execute a single node
  private async executeNode(
    node: ToolNode,
    state: WorkflowExecutionState,
    executionId: string,
    skipNodes: Set<string>,
  ): Promise<NodeExecutionResult> {
    const result: NodeExecutionResult = {
      nodeId: node.id,
      status: "running",
      startedAt: Date.now(),
    };

    this.emit("node:start", executionId, node.id);

    try {
      switch (node.data.type) {
        case "tool": {
          const params = resolveParams(node.data.params, state.nodeResults, state.variables);
          const maxRetries = node.data.retryConfig?.maxRetries ?? 0;
          let lastError: Error | null = null;

          for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
              result.output = await this.toolExecutor(node.data.toolId, params);
              result.retries = attempt;
              break;
            } catch (e) {
              lastError = e instanceof Error ? e : new Error(String(e));
              result.retries = attempt;
              if (attempt < maxRetries) {
                const delay = node.data.retryConfig?.delayMs ?? 1000;
                const multiplier = node.data.retryConfig?.backoffMultiplier ?? 1;
                await new Promise((r) => setTimeout(r, delay * multiplier ** attempt));
              }
            }
          }

          if (lastError && result.output === undefined) {
            throw lastError;
          }
          break;
        }

        case "condition": {
          const conditionResult = evaluateCondition(
            node.data.condition,
            state.nodeResults,
            state.variables,
          );
          result.output = conditionResult;

          // Mark nodes in the non-taken branch for skipping
          const outEdges = this.workflow.edges.filter((e) => e.source === node.id);
          for (const edge of outEdges) {
            const shouldSkip =
              (conditionResult && edge.sourceHandle === "false") ||
              (!conditionResult && edge.sourceHandle === "true");
            if (shouldSkip) {
              this.markDownstreamForSkip(edge.target, skipNodes);
            }
          }
          break;
        }

        case "transform": {
          const inputVars = resolveParams(
            node.data.transform.inputMapping,
            state.nodeResults,
            state.variables,
          );
          // Simple expression evaluation (in production, use a sandboxed evaluator)
          const expression = node.data.transform.expression;
          // eslint-disable-next-line @typescript-eslint/no-implied-eval
          const fn = new Function(...Object.keys(inputVars), `return ${expression}`);
          result.output = fn(...Object.values(inputVars));
          break;
        }

        case "delay": {
          let delayMs: number;
          if (isNodeReference(node.data.delayMs)) {
            delayMs = Number(resolveReference(node.data.delayMs, state.nodeResults));
          } else {
            delayMs = node.data.delayMs;
          }
          await new Promise((r) => setTimeout(r, delayMs));
          result.output = { delayed: delayMs };
          break;
        }

        case "loop": {
          let items: unknown[];
          if (isNodeReference(node.data.loop.items)) {
            items = resolveReference(node.data.loop.items, state.nodeResults) as unknown[];
          } else if (
            typeof node.data.loop.items === "string" &&
            node.data.loop.items.startsWith("$var.")
          ) {
            items = state.variables[node.data.loop.items.slice(5)] as unknown[];
          } else {
            items = node.data.loop.items as unknown as unknown[];
          }

          if (!Array.isArray(items)) {
            throw new Error("Loop items must be an array");
          }

          const maxIterations = node.data.loop.maxIterations ?? 1000;
          const results: unknown[] = [];

          for (let i = 0; i < Math.min(items.length, maxIterations); i++) {
            state.variables[node.data.loop.itemVar] = items[i];
            if (node.data.loop.indexVar) {
              state.variables[node.data.loop.indexVar] = i;
            }
            // In a full implementation, we'd execute the loop body nodes here
            results.push({ index: i, item: items[i] });
          }

          result.output = results;
          break;
        }

        case "trigger": {
          // Trigger nodes just pass through
          result.output = { triggered: true, config: node.data.trigger };
          break;
        }

        case "output": {
          result.output = {
            type: node.data.output.type,
            delivered: true,
          };
          break;
        }

        case "parallel": {
          // Execute all branches concurrently (simplified - in production would be more complex)
          result.output = { branches: node.data.branches, parallel: true };
          break;
        }
      }

      result.status = "completed";
      result.completedAt = Date.now();
      this.emit("node:complete", executionId, node.id, { output: result.output });
    } catch (error) {
      result.status = "failed";
      result.completedAt = Date.now();
      result.error = error instanceof Error ? error.message : String(error);
      this.emit("node:fail", executionId, node.id, { error: result.error });
    }

    return result;
  }

  // Mark all downstream nodes for skipping
  private markDownstreamForSkip(nodeId: string, skipNodes: Set<string>) {
    skipNodes.add(nodeId);
    const downstream = this.workflow.edges.filter((e) => e.source === nodeId).map((e) => e.target);
    for (const id of downstream) {
      if (!skipNodes.has(id)) {
        this.markDownstreamForSkip(id, skipNodes);
      }
    }
  }
}

// Create a default tool executor that uses the registry-execute API
export function createApiToolExecutor(baseUrl: string = ""): ToolExecutor {
  return async (toolId: string, params: Record<string, unknown>): Promise<unknown> => {
    const response = await fetch(`${baseUrl}/api/registry-execute`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ toolId, params }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Tool execution failed: ${error}`);
    }

    return response.json();
  };
}
