"use client";

import type { ReactNode } from "react";
import styles from "./StateGrid.module.css";

export interface StateGridProps {
  /**
   * Number of columns
   * @default 4
   */
  columns?: 2 | 3 | 4 | 5 | 6;
  /**
   * State items
   */
  children: ReactNode;
}

export function StateGrid({ columns = 4, children }: StateGridProps) {
  return (
    <div className={styles.grid} data-columns={columns}>
      {children}
    </div>
  );
}

/* ============================================
 * STATE ITEM
 * ============================================ */

export interface StateItemProps {
  /**
   * State label (e.g., "Default", "Hover", "Disabled")
   */
  label: string;
  /**
   * Optional description
   */
  description?: string;
  /**
   * Whether to use dark background
   */
  dark?: boolean;
  /**
   * Content to display
   */
  children: ReactNode;
}

export function StateItem({ label, description, dark = false, children }: StateItemProps) {
  return (
    <div className={styles.item} data-dark={dark}>
      <div className={styles.preview}>{children}</div>
      <div className={styles.info}>
        <span className={styles.label}>{label}</span>
        {description && <span className={styles.description}>{description}</span>}
      </div>
    </div>
  );
}

/* ============================================
 * STATE COMPARISON
 * ============================================ */

export interface StateComparisonProps {
  /**
   * Title for the comparison
   */
  title?: string;
  /**
   * Comparison items
   */
  children: ReactNode;
}

export function StateComparison({ title, children }: StateComparisonProps) {
  return (
    <div className={styles.comparison}>
      {title && <h4 className={styles.comparisonTitle}>{title}</h4>}
      <div className={styles.comparisonGrid}>{children}</div>
    </div>
  );
}

/* ============================================
 * SIZE COMPARISON
 * ============================================ */

export interface SizeComparisonProps {
  /**
   * Size comparison items
   */
  children: ReactNode;
}

export function SizeComparison({ children }: SizeComparisonProps) {
  return <div className={styles.sizeComparison}>{children}</div>;
}

export interface SizeItemProps {
  /**
   * Size label (e.g., "sm", "md", "lg")
   */
  size: string;
  /**
   * Content to display
   */
  children: ReactNode;
}

export function SizeItem({ size, children }: SizeItemProps) {
  return (
    <div className={styles.sizeItem}>
      <span className={styles.sizeLabel}>{size}</span>
      <div className={styles.sizePreview}>{children}</div>
    </div>
  );
}
