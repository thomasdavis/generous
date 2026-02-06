"use client";

import { Input } from "@generous/ui";
import { useState } from "react";
import type { ToolNode } from "@/lib/workflow/types";
import styles from "./WorkflowSidebar.module.css";

interface WorkflowSidebarProps {
  onAddNode: (type: ToolNode["data"]["type"], toolId?: string) => void;
  selectedNode: ToolNode | null;
  onUpdateNode: (updates: Partial<ToolNode>) => void;
}

const NODE_TYPES = [
  { type: "trigger" as const, label: "Trigger", icon: "⚡", description: "Start workflow" },
  { type: "tool" as const, label: "Tool", icon: "🔧", description: "Execute a tool" },
  { type: "condition" as const, label: "Condition", icon: "⑂", description: "Branch logic" },
  { type: "loop" as const, label: "Loop", icon: "🔄", description: "Iterate items" },
  { type: "transform" as const, label: "Transform", icon: "🔀", description: "Transform data" },
  { type: "delay" as const, label: "Delay", icon: "⏱", description: "Wait before continuing" },
  { type: "output" as const, label: "Output", icon: "📤", description: "Output result" },
];

export function WorkflowSidebar({ onAddNode, selectedNode, onUpdateNode }: WorkflowSidebarProps) {
  const [activeTab, setActiveTab] = useState<"nodes" | "properties">("nodes");

  return (
    <div className={styles.sidebar}>
      <div className={styles.tabs}>
        <button
          type="button"
          className={`${styles.tab} ${activeTab === "nodes" ? styles.tabActive : ""}`}
          onClick={() => setActiveTab("nodes")}
        >
          Nodes
        </button>
        <button
          type="button"
          className={`${styles.tab} ${activeTab === "properties" ? styles.tabActive : ""}`}
          onClick={() => setActiveTab("properties")}
          disabled={!selectedNode}
        >
          Properties
        </button>
      </div>

      {activeTab === "nodes" ? (
        <div className={styles.nodeList}>
          <p className={styles.hint}>Drag to canvas or click to add</p>
          {NODE_TYPES.map((nodeType) => (
            <button
              type="button"
              key={nodeType.type}
              className={styles.nodeItem}
              onClick={() => onAddNode(nodeType.type)}
              draggable
            >
              <span className={styles.nodeIcon}>{nodeType.icon}</span>
              <div className={styles.nodeInfo}>
                <span className={styles.nodeLabel}>{nodeType.label}</span>
                <span className={styles.nodeDescription}>{nodeType.description}</span>
              </div>
            </button>
          ))}
        </div>
      ) : selectedNode ? (
        <div className={styles.properties}>
          <div className={styles.field}>
            <label className={styles.label}>Label</label>
            <Input
              value={selectedNode.label || ""}
              onChange={(e) => onUpdateNode({ label: e.target.value })}
              placeholder="Node label"
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Type</label>
            <div className={styles.typeDisplay}>{selectedNode.data.type}</div>
          </div>

          {/* Tool-specific properties */}
          {selectedNode.data.type === "tool" && (
            <>
              <div className={styles.field}>
                <label className={styles.label}>Tool ID</label>
                <Input
                  value={selectedNode.data.toolId}
                  onChange={(e) =>
                    onUpdateNode({
                      data: { ...selectedNode.data, toolId: e.target.value },
                    })
                  }
                  placeholder="e.g., @stripe/createPayment"
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Parameters (JSON)</label>
                <textarea
                  className={styles.textarea}
                  value={JSON.stringify(selectedNode.data.params, null, 2)}
                  onChange={(e) => {
                    try {
                      const params = JSON.parse(e.target.value);
                      onUpdateNode({
                        data: { ...selectedNode.data, params },
                      });
                    } catch {
                      // Invalid JSON, ignore
                    }
                  }}
                  rows={6}
                />
              </div>
            </>
          )}

          {/* Condition-specific properties */}
          {selectedNode.data.type === "condition" && (
            <>
              <div className={styles.field}>
                <label className={styles.label}>Left Operand</label>
                <Input
                  value={String(selectedNode.data.condition.leftOperand)}
                  onChange={(e) =>
                    onUpdateNode({
                      data: {
                        ...selectedNode.data,
                        condition: {
                          ...selectedNode.data.condition,
                          leftOperand: e.target.value,
                        },
                      },
                    })
                  }
                  placeholder="e.g., node1.output.value"
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Operator</label>
                <select
                  className={styles.select}
                  value={selectedNode.data.condition.operator}
                  onChange={(e) =>
                    onUpdateNode({
                      data: {
                        ...selectedNode.data,
                        condition: {
                          ...selectedNode.data.condition,
                          operator: e.target.value as "eq" | "neq" | "gt" | "lt",
                        },
                      },
                    })
                  }
                >
                  <option value="eq">Equals (==)</option>
                  <option value="neq">Not Equals (!=)</option>
                  <option value="gt">Greater Than (&gt;)</option>
                  <option value="gte">Greater or Equal (&gt;=)</option>
                  <option value="lt">Less Than (&lt;)</option>
                  <option value="lte">Less or Equal (&lt;=)</option>
                  <option value="contains">Contains</option>
                  <option value="startsWith">Starts With</option>
                  <option value="endsWith">Ends With</option>
                </select>
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Right Operand</label>
                <Input
                  value={String(selectedNode.data.condition.rightOperand)}
                  onChange={(e) =>
                    onUpdateNode({
                      data: {
                        ...selectedNode.data,
                        condition: {
                          ...selectedNode.data.condition,
                          rightOperand: e.target.value,
                        },
                      },
                    })
                  }
                  placeholder="Value to compare"
                />
              </div>
            </>
          )}

          {/* Delay-specific properties */}
          {selectedNode.data.type === "delay" && (
            <div className={styles.field}>
              <label className={styles.label}>Delay (ms)</label>
              <Input
                type="number"
                value={selectedNode.data.delayMs as number}
                onChange={(e) =>
                  onUpdateNode({
                    data: { ...selectedNode.data, delayMs: parseInt(e.target.value, 10) || 0 },
                  })
                }
                min={0}
              />
            </div>
          )}

          {/* Trigger-specific properties */}
          {selectedNode.data.type === "trigger" && (
            <div className={styles.field}>
              <label className={styles.label}>Trigger Type</label>
              <select
                className={styles.select}
                value={selectedNode.data.trigger.type}
                onChange={(e) =>
                  onUpdateNode({
                    data: {
                      ...selectedNode.data,
                      trigger: {
                        ...selectedNode.data.trigger,
                        type: e.target.value as "manual" | "cron" | "webhook",
                      },
                    },
                  })
                }
              >
                <option value="manual">Manual</option>
                <option value="cron">Scheduled (Cron)</option>
                <option value="webhook">Webhook</option>
              </select>
            </div>
          )}
        </div>
      ) : (
        <div className={styles.noSelection}>
          <p>Select a node to view its properties</p>
        </div>
      )}
    </div>
  );
}
