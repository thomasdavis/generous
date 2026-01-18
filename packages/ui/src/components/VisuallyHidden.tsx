"use client";

import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { forwardRef } from "react";
import styles from "./VisuallyHidden.module.css";

export interface VisuallyHiddenProps extends ComponentPropsWithoutRef<"span"> {
  /**
   * Content to be visually hidden but accessible to screen readers
   */
  children: ReactNode;
}

/**
 * VisuallyHidden renders content that is hidden visually but remains accessible
 * to screen readers. Use this for providing context that sighted users can infer
 * from visual cues but screen reader users cannot.
 *
 * @example
 * <button>
 *   <Icon name="close" />
 *   <VisuallyHidden>Close dialog</VisuallyHidden>
 * </button>
 */
export const VisuallyHidden = forwardRef<HTMLSpanElement, VisuallyHiddenProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <span ref={ref} className={styles.root} {...props}>
        {children}
      </span>
    );
  },
);

VisuallyHidden.displayName = "VisuallyHidden";
