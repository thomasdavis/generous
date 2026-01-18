"use client";

import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { forwardRef } from "react";
import { cn, dataAttrs } from "../utils/cn";
import styles from "./Badge.module.css";

export interface BadgeProps extends ComponentPropsWithoutRef<"span"> {
  /**
   * Visual style variant
   * @default "default"
   */
  variant?: "default" | "secondary" | "outline" | "success" | "warning" | "error" | "accent";
  /**
   * Size of the badge
   * @default "md"
   */
  size?: "sm" | "md" | "lg";
  /**
   * Badge content
   */
  children?: ReactNode;
}

/**
 * Badge displays a small status or label.
 *
 * @example
 * <Badge>New</Badge>
 *
 * @example
 * <Badge variant="success">Active</Badge>
 *
 * @example
 * <Badge variant="accent">Pro</Badge>
 */
export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ variant = "default", size = "md", children, className, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(styles.root, className)}
        {...dataAttrs({ variant, size })}
        {...props}
      >
        {children}
      </span>
    );
  },
);

Badge.displayName = "Badge";
