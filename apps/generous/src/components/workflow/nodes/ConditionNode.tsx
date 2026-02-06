"use client";

import type { ToolNode } from "@/lib/workflow/types";
import styles from "./NodeStyles.module.css";

interface ConditionNodeComponentProps {
  node: ToolNode;
  isSelected: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
  onDelete: () => void;
  onStartConnection: (x: number, y: number, handle?: string) => void;
  onCompleteConnection: () => void;
}

export function ConditionNodeComponent({
  node,
  isSelected,
  onMouseDown,
  onDelete,
  onStartConnection,
  onCompleteConnection,
}: ConditionNodeComponentProps) {
  if (node.data.type !== "condition") return null;

  const operatorLabels: Record<string, string> = {
    eq: "==",
    neq: "!=",
    gt: ">",
    gte: ">=",
    lt: "<",
    lte: "<=",
    contains: "contains",
    startsWith: "starts with",
    endsWith: "ends with",
    regex: "matches",
  };

  return (
    <div
      className={`${styles.node} ${styles.conditionNode} ${isSelected ? styles.selected : ""}`}
      style={{
        left: node.position.x,
        top: node.position.y,
      }}
      onMouseDown={onMouseDown}
    >
      <div className={styles.header}>
        <span className={styles.icon}>⑂</span>
        <span className={styles.type}>Condition</span>
        <button type="button" className={styles.delete} onClick={onDelete}>
          ×
        </button>
      </div>
      <div className={styles.body}>
        <div className={styles.label}>{node.label || "Untitled Condition"}</div>
        <div className={styles.detail}>
          {node.data.condition.leftOperand} {operatorLabels[node.data.condition.operator]}{" "}
          {String(node.data.condition.rightOperand)}
        </div>
      </div>

      {/* Input handle */}
      <div className={`${styles.handle} ${styles.handleInput}`} onMouseUp={onCompleteConnection} />

      {/* True output handle */}
      <div
        className={`${styles.handle} ${styles.handleOutputTrue}`}
        onMouseDown={(e) => {
          e.stopPropagation();
          const rect = e.currentTarget.getBoundingClientRect();
          onStartConnection(rect.right, rect.top + rect.height / 2, "true");
        }}
      >
        <span className={styles.handleLabel}>✓</span>
      </div>

      {/* False output handle */}
      <div
        className={`${styles.handle} ${styles.handleOutputFalse}`}
        onMouseDown={(e) => {
          e.stopPropagation();
          const rect = e.currentTarget.getBoundingClientRect();
          onStartConnection(rect.right, rect.top + rect.height / 2, "false");
        }}
      >
        <span className={styles.handleLabel}>✗</span>
      </div>
    </div>
  );
}
