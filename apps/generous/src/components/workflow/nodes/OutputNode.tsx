"use client";

import type { ToolNode } from "@/lib/workflow/types";
import styles from "./NodeStyles.module.css";

interface OutputNodeComponentProps {
  node: ToolNode;
  isSelected: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
  onDelete: () => void;
  onStartConnection: (x: number, y: number, handle?: string) => void;
  onCompleteConnection: () => void;
}

export function OutputNodeComponent({
  node,
  isSelected,
  onMouseDown,
  onDelete,
  onCompleteConnection,
}: OutputNodeComponentProps) {
  if (node.data.type !== "output") return null;

  const outputTypeLabels: Record<string, string> = {
    component: "Render Component",
    data: "Output Data",
    notification: "Send Notification",
  };

  return (
    <div
      className={`${styles.node} ${styles.outputNode} ${isSelected ? styles.selected : ""}`}
      style={{
        left: node.position.x,
        top: node.position.y,
      }}
      onMouseDown={onMouseDown}
    >
      <div className={styles.header}>
        <span className={styles.icon}>📤</span>
        <span className={styles.type}>Output</span>
        <button type="button" className={styles.delete} onClick={onDelete}>
          ×
        </button>
      </div>
      <div className={styles.body}>
        <div className={styles.label}>{node.label || "Untitled Output"}</div>
        <div className={styles.detail}>{outputTypeLabels[node.data.output.type]}</div>
      </div>

      {/* Input handle only - no outputs */}
      <div className={`${styles.handle} ${styles.handleInput}`} onMouseUp={onCompleteConnection} />
    </div>
  );
}
