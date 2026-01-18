"use client";

import type { ComponentPropsWithoutRef } from "react";
import { forwardRef } from "react";
import { cn, dataAttrs } from "../utils/cn";
import styles from "./Progress.module.css";

export interface ProgressProps extends ComponentPropsWithoutRef<"div"> {
  /**
   * Current progress value (0-100)
   */
  value?: number;
  /**
   * Maximum value
   * @default 100
   */
  max?: number;
  /**
   * Whether to show indeterminate animation
   * @default false
   */
  indeterminate?: boolean;
  /**
   * Size of the progress bar
   * @default "md"
   */
  size?: "sm" | "md" | "lg";
  /**
   * Visual style variant
   * @default "default"
   */
  variant?: "default" | "accent";
}

/**
 * Progress displays the completion status of a task or process.
 *
 * @example
 * <Progress value={60} />
 *
 * @example
 * // Indeterminate loading
 * <Progress indeterminate />
 *
 * @example
 * // With accent color
 * <Progress value={80} variant="accent" />
 */
export const Progress = forwardRef<HTMLDivElement, ProgressProps>(
  (
    {
      value = 0,
      max = 100,
      indeterminate = false,
      size = "md",
      variant = "default",
      className,
      ...props
    },
    ref,
  ) => {
    // Clamp value between 0 and max
    const percentage = indeterminate ? 0 : Math.min(Math.max((value / max) * 100, 0), 100);

    return (
      <div
        ref={ref}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={indeterminate ? undefined : value}
        aria-valuetext={indeterminate ? "Loading..." : `${Math.round(percentage)}%`}
        className={cn(styles.root, className)}
        {...dataAttrs({ size, variant, indeterminate })}
        {...props}
      >
        <div
          className={styles.indicator}
          style={indeterminate ? undefined : { transform: `translateX(-${100 - percentage}%)` }}
        />
      </div>
    );
  },
);

Progress.displayName = "Progress";
