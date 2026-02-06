"use client";

import { Button } from "@generous/ui";
import type { WorkflowDefinition } from "@/lib/workflow/types";
import styles from "./WorkflowToolbar.module.css";

interface WorkflowToolbarProps {
  workflow: WorkflowDefinition;
  onSave: () => Promise<void>;
  onRun: () => Promise<void>;
  isSaving?: boolean;
  isRunning?: boolean;
}

export function WorkflowToolbar({
  workflow,
  onSave,
  onRun,
  isSaving,
  isRunning,
}: WorkflowToolbarProps) {
  return (
    <div className={styles.toolbar}>
      <div className={styles.left}>
        <a href="/workflows" className={styles.backLink}>
          ← Back
        </a>
        <h1 className={styles.title}>{workflow.name}</h1>
        {workflow.description && <span className={styles.description}>{workflow.description}</span>}
      </div>

      <div className={styles.stats}>
        <span className={styles.stat}>
          <span className={styles.statLabel}>Nodes:</span>
          <span className={styles.statValue}>{workflow.nodes.length}</span>
        </span>
        <span className={styles.stat}>
          <span className={styles.statLabel}>Edges:</span>
          <span className={styles.statValue}>{workflow.edges.length}</span>
        </span>
      </div>

      <div className={styles.actions}>
        <Button variant="ghost" onClick={onSave} disabled={isSaving}>
          {isSaving ? "Saving..." : "Save"}
        </Button>
        <Button onClick={onRun} disabled={isRunning || workflow.nodes.length === 0}>
          {isRunning ? "Running..." : "Run"}
        </Button>
      </div>
    </div>
  );
}
