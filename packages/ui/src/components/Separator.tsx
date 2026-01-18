"use client";

import type { ComponentPropsWithoutRef } from "react";
import { forwardRef } from "react";
import { cn, dataAttrs } from "../utils/cn";
import styles from "./Separator.module.css";

export interface SeparatorProps extends ComponentPropsWithoutRef<"div"> {
  /**
   * The orientation of the separator
   * @default "horizontal"
   */
  orientation?: "horizontal" | "vertical";
  /**
   * Whether the separator is purely decorative (no semantic meaning)
   * @default true
   */
  decorative?: boolean;
}

/**
 * Separator visually or semantically separates content.
 *
 * @example
 * <Separator />
 *
 * @example
 * // Vertical separator in a flex container
 * <div style={{ display: 'flex', alignItems: 'center' }}>
 *   <span>Left</span>
 *   <Separator orientation="vertical" />
 *   <span>Right</span>
 * </div>
 *
 * @example
 * // Non-decorative separator with accessible label
 * <Separator decorative={false} aria-label="Section divider" />
 */
export const Separator = forwardRef<HTMLDivElement, SeparatorProps>(
  ({ orientation = "horizontal", decorative = true, className, ...props }, ref) => {
    // Determine the semantic role
    // If decorative, use role="none" to hide from screen readers
    // Otherwise, use role="separator" with proper ARIA
    const semanticProps = decorative
      ? { role: "none" as const }
      : {
          role: "separator" as const,
          "aria-orientation": orientation,
        };

    return (
      <div
        ref={ref}
        className={cn(styles.root, className)}
        {...dataAttrs({ orientation })}
        {...semanticProps}
        {...props}
      />
    );
  },
);

Separator.displayName = "Separator";
