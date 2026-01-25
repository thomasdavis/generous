"use client";

import type { ReactNode } from "react";
import styles from "./ComponentPage.module.css";

export interface ComponentPageProps {
  /**
   * Component name (e.g., "Dialog", "Button")
   */
  name: string;
  /**
   * Short description of the component
   */
  description: string;
  /**
   * Category the component belongs to
   */
  category?: string;
  /**
   * Whether this component uses Base UI
   */
  usesBaseUI?: boolean;
  /**
   * Link to Base UI documentation
   */
  baseUIUrl?: string;
  /**
   * Main content of the page
   */
  children: ReactNode;
}

export function ComponentPage({
  name,
  description,
  category,
  usesBaseUI,
  baseUIUrl,
  children,
}: ComponentPageProps) {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.meta}>
          {category && <span className={styles.category}>{category}</span>}
          {usesBaseUI && (
            <a
              href={baseUIUrl || "https://base-ui.com"}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.baseUI}
            >
              Base UI
            </a>
          )}
        </div>
        <h1 className={styles.title}>{name}</h1>
        <p className={styles.description}>{description}</p>
      </header>
      <main className={styles.content}>{children}</main>
    </div>
  );
}

/* ============================================
 * SECTION
 * ============================================ */

export interface SectionProps {
  /**
   * Section title
   */
  title: string;
  /**
   * Optional description
   */
  description?: string;
  /**
   * Section content
   */
  children: ReactNode;
}

export function Section({ title, description, children }: SectionProps) {
  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>{title}</h2>
      {description && <p className={styles.sectionDescription}>{description}</p>}
      <div className={styles.sectionContent}>{children}</div>
    </section>
  );
}

/* ============================================
 * PREVIEW BOX
 * ============================================ */

export interface PreviewBoxProps {
  /**
   * Optional label for the preview
   */
  label?: string;
  /**
   * Whether to use dark background
   */
  dark?: boolean;
  /**
   * Center the content
   */
  center?: boolean;
  /**
   * Add padding
   */
  padded?: boolean;
  /**
   * Preview content
   */
  children: ReactNode;
}

export function PreviewBox({
  label,
  dark = false,
  center = true,
  padded = true,
  children,
}: PreviewBoxProps) {
  return (
    <div className={styles.previewBox} data-dark={dark} data-padded={padded}>
      {label && <span className={styles.previewLabel}>{label}</span>}
      <div className={styles.previewContent} data-center={center}>
        {children}
      </div>
    </div>
  );
}

/* ============================================
 * VARIANT GRID
 * ============================================ */

export interface VariantGridProps {
  /**
   * Number of columns
   * @default 2
   */
  columns?: 1 | 2 | 3 | 4;
  /**
   * Grid items
   */
  children: ReactNode;
}

export function VariantGrid({ columns = 2, children }: VariantGridProps) {
  return (
    <div className={styles.variantGrid} data-columns={columns}>
      {children}
    </div>
  );
}

/* ============================================
 * VARIANT CARD
 * ============================================ */

export interface VariantCardProps {
  /**
   * Variant name
   */
  title: string;
  /**
   * Variant description
   */
  description?: string;
  /**
   * Card content
   */
  children: ReactNode;
}

export function VariantCard({ title, description, children }: VariantCardProps) {
  return (
    <div className={styles.variantCard}>
      <div className={styles.variantPreview}>{children}</div>
      <div className={styles.variantInfo}>
        <h3 className={styles.variantTitle}>{title}</h3>
        {description && <p className={styles.variantDescription}>{description}</p>}
      </div>
    </div>
  );
}
