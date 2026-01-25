"use client";

import { Button } from "@generous/ui";
import type { StoredComponent } from "@/lib/db";
import styles from "./MergeModal.module.css";

interface MergeModalProps {
  componentA: StoredComponent;
  componentB: StoredComponent;
  onMerge: () => void;
  onCancel: () => void;
  isMerging?: boolean;
}

export function MergeModal({
  componentA,
  componentB,
  onMerge,
  onCancel,
  isMerging = false,
}: MergeModalProps) {
  return (
    <div className={styles.overlay} onClick={onCancel}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Merge Components?</h2>
        </div>

        <div className={styles.content}>
          <p className={styles.description}>Do you want to merge these two components into one?</p>

          <div className={styles.components}>
            <div className={styles.componentPreview}>
              <span className={styles.componentName}>{componentA.name}</span>
            </div>
            <div className={styles.plusIcon}>+</div>
            <div className={styles.componentPreview}>
              <span className={styles.componentName}>{componentB.name}</span>
            </div>
          </div>

          <p className={styles.hint}>
            AI will intelligently combine both components into a single unified widget.
          </p>
        </div>

        <div className={styles.actions}>
          <Button variant="ghost" onClick={onCancel} disabled={isMerging}>
            Cancel
          </Button>
          <Button variant="primary" onClick={onMerge} disabled={isMerging}>
            {isMerging ? "Merging..." : "Merge"}
          </Button>
        </div>
      </div>
    </div>
  );
}
