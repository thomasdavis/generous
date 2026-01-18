"use client";

import type { ComponentPropsWithoutRef } from "react";
import { forwardRef } from "react";
import { cn, dataAttrs } from "../utils/cn";
import styles from "./Spinner.module.css";

export interface SpinnerProps extends ComponentPropsWithoutRef<"div"> {
  /**
   * Size of the spinner
   * @default "md"
   */
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  /**
   * Accessible label
   * @default "Loading"
   */
  label?: string;
}

/**
 * Spinner displays a loading indicator.
 *
 * @example
 * <Spinner />
 *
 * @example
 * <Spinner size="lg" label="Loading data..." />
 *
 * @example
 * // Inside a button
 * <Button disabled>
 *   <Spinner size="sm" />
 *   Loading...
 * </Button>
 */
export const Spinner = forwardRef<HTMLDivElement, SpinnerProps>(
  ({ size = "md", label = "Loading", className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        role="status"
        aria-label={label}
        className={cn(styles.root, className)}
        {...dataAttrs({ size })}
        {...props}
      >
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className={styles.svg}>
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            className={styles.track}
          />
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray="31.4 31.4"
            className={styles.indicator}
          />
        </svg>
        <span className={styles.srOnly}>{label}</span>
      </div>
    );
  },
);

Spinner.displayName = "Spinner";
