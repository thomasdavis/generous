"use client";

import type { ToolNode } from "@/lib/workflow/types";
import styles from "./NodeStyles.module.css";

interface ToolNodeComponentProps {
  node: ToolNode;
  isSelected: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
  onDelete: () => void;
  onStartConnection: (x: number, y: number, handle?: string) => void;
  onCompleteConnection: () => void;
}

export function ToolNodeComponent({
  node,
  isSelected,
  onMouseDown,
  onDelete,
  onStartConnection,
  onCompleteConnection,
}: ToolNodeComponentProps) {
  if (node.data.type !== "tool") return null;

  return (
    <div
      className={`${styles.node} ${styles.toolNode} ${isSelected ? styles.selected : ""}`}
      style={{
        left: node.position.x,
        top: node.position.y,
      }}
      onMouseDown={onMouseDown}
    >
      <div className={styles.header}>
        <span className={styles.icon}>🔧</span>
        <span className={styles.type}>Tool</span>
        <button type="button" className={styles.delete} onClick={onDelete}>
          ×
        </button>
      </div>
      <div className={styles.body}>
        <div className={styles.label}>{node.label || "Untitled Tool"}</div>
        <div className={styles.detail}>{node.data.toolId || <em>No tool selected</em>}</div>
      </div>

      {/* Input handle */}
      <div className={`${styles.handle} ${styles.handleInput}`} onMouseUp={onCompleteConnection} />

      {/* Output handle */}
      <div
        className={`${styles.handle} ${styles.handleOutput}`}
        onMouseDown={(e) => {
          e.stopPropagation();
          const rect = e.currentTarget.getBoundingClientRect();
          onStartConnection(rect.right, rect.top + rect.height / 2);
        }}
      />
    </div>
  );
}
