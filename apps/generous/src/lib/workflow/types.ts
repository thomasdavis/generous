/**
 * ToolNode Dataflow System - Type Definitions
 *
 * This module defines the types for the visual workflow editor and execution engine.
 * Workflows are directed acyclic graphs (DAGs) of nodes connected by edges.
 */

// Node reference for chaining outputs between nodes
export interface NodeReference {
  $ref: string; // Format: "nodeId.outputPath" e.g., "node1.data.items"
}

// Check if a value is a node reference
export function isNodeReference(value: unknown): value is NodeReference {
  return typeof value === "object" && value !== null && "$ref" in value;
}

// Base position for visual editor
export interface NodePosition {
  x: number;
  y: number;
}

// Condition configuration for conditional nodes
export interface ConditionConfig {
  leftOperand: string | NodeReference; // Path or reference to value
  operator:
    | "eq"
    | "neq"
    | "gt"
    | "gte"
    | "lt"
    | "lte"
    | "contains"
    | "startsWith"
    | "endsWith"
    | "regex";
  rightOperand: unknown; // Value to compare against
}

// Loop configuration for iteration nodes
export interface LoopConfig {
  items: string | NodeReference; // Path or reference to array
  itemVar: string; // Variable name for current item
  indexVar?: string; // Variable name for current index
  maxIterations?: number; // Safety limit
}

// Transform configuration for data manipulation
export interface TransformConfig {
  expression: string; // JavaScript expression or JSONPath
  inputMapping: Record<string, string | NodeReference>; // Map inputs to variables
}

// Trigger configuration
export interface TriggerConfig {
  type: "manual" | "cron" | "webhook" | "event";
  cron?: string; // Cron expression for scheduled triggers
  webhookPath?: string; // Path for webhook triggers
  eventType?: string; // Event type for event triggers
}

// Output configuration for rendering or emitting data
export interface OutputConfig {
  type: "component" | "data" | "notification";
  componentTree?: unknown; // JSONL component definition
  dataPath?: string; // Where to store output data
  notificationConfig?: {
    title: string;
    message: string;
    type: "success" | "error" | "warning" | "info";
  };
}

// Error handling configuration
export type ErrorHandling = "stop" | "continue" | "retry";

export interface RetryConfig {
  maxRetries: number;
  delayMs: number;
  backoffMultiplier?: number;
}

// Tool node - executes a registered tool
export interface ToolNodeData {
  type: "tool";
  toolId: string; // Tool identifier (e.g., "@stripe/createPayment")
  params: Record<string, unknown | NodeReference>;
  onError?: ErrorHandling;
  retryConfig?: RetryConfig;
}

// Condition node - branching logic
export interface ConditionNodeData {
  type: "condition";
  condition: ConditionConfig;
  trueOutput?: string; // Handle ID for true branch
  falseOutput?: string; // Handle ID for false branch
}

// Loop node - iterate over array
export interface LoopNodeData {
  type: "loop";
  loop: LoopConfig;
  bodyNodeId?: string; // Node to execute for each item
}

// Transform node - data manipulation
export interface TransformNodeData {
  type: "transform";
  transform: TransformConfig;
}

// Trigger node - workflow entry point
export interface TriggerNodeData {
  type: "trigger";
  trigger: TriggerConfig;
}

// Output node - workflow endpoint
export interface OutputNodeData {
  type: "output";
  output: OutputConfig;
}

// Delay node - pause execution
export interface DelayNodeData {
  type: "delay";
  delayMs: number | NodeReference;
}

// Parallel node - execute multiple branches concurrently
export interface ParallelNodeData {
  type: "parallel";
  branches: string[]; // Node IDs to execute in parallel
  waitForAll: boolean; // Wait for all branches or first to complete
}

// Union type for all node data types
export type ToolNodeDataUnion =
  | ToolNodeData
  | ConditionNodeData
  | LoopNodeData
  | TransformNodeData
  | TriggerNodeData
  | OutputNodeData
  | DelayNodeData
  | ParallelNodeData;

// Complete ToolNode with position and metadata
export interface ToolNode {
  id: string;
  position: NodePosition;
  data: ToolNodeDataUnion;
  label?: string;
  description?: string;
  disabled?: boolean;
}

// Edge connecting two nodes
export interface WorkflowEdge {
  id: string;
  source: string; // Source node ID
  target: string; // Target node ID
  sourceHandle?: string; // Output handle (for conditional branches)
  targetHandle?: string; // Input handle
  label?: string;
  animated?: boolean;
}

// Variable definition for workflow context
export interface WorkflowVariable {
  name: string;
  type: "string" | "number" | "boolean" | "object" | "array";
  defaultValue?: unknown;
  description?: string;
}

// Complete workflow definition
export interface WorkflowDefinition {
  id: string;
  name: string;
  description?: string;
  nodes: ToolNode[];
  edges: WorkflowEdge[];
  variables: WorkflowVariable[];
  triggerConfig?: TriggerConfig;
  settings?: {
    maxExecutionTime?: number; // ms
    maxNodeExecutions?: number;
    enableLogging?: boolean;
  };
}

// Execution status for individual nodes
export interface NodeExecutionResult {
  nodeId: string;
  status: "pending" | "running" | "completed" | "failed" | "skipped";
  startedAt?: number;
  completedAt?: number;
  output?: unknown;
  error?: string;
  retries?: number;
}

// Complete execution state
export interface WorkflowExecutionState {
  id: string;
  workflowId: string;
  status: "pending" | "running" | "completed" | "failed" | "cancelled";
  triggeredBy: string;
  triggeredAt: number;
  startedAt?: number;
  completedAt?: number;
  nodeResults: Record<string, NodeExecutionResult>;
  variables: Record<string, unknown>;
  error?: string;
  metadata?: Record<string, unknown>;
}

// Event types for execution progress
export type WorkflowEventType =
  | "execution:start"
  | "execution:complete"
  | "execution:fail"
  | "node:start"
  | "node:complete"
  | "node:fail"
  | "node:skip";

export interface WorkflowEvent {
  type: WorkflowEventType;
  executionId: string;
  nodeId?: string;
  timestamp: number;
  data?: unknown;
}

// Execution trigger payload
export interface ExecutionTrigger {
  type: "manual" | "cron" | "webhook" | "event";
  userId?: string;
  webhookPayload?: unknown;
  eventPayload?: unknown;
  variables?: Record<string, unknown>;
}
