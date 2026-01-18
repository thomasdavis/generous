"use client";

import type { ComponentPropsWithoutRef } from "react";
import { forwardRef } from "react";
import { cn, dataAttrs } from "../utils/cn";
import styles from "./Textarea.module.css";

export interface TextareaProps extends ComponentPropsWithoutRef<"textarea"> {
  /**
   * Size of the textarea
   * @default "md"
   */
  size?: "sm" | "md" | "lg";
  /**
   * Whether the textarea is in error state
   */
  error?: boolean;
  /**
   * Whether to allow vertical resizing
   * @default true
   */
  resizable?: boolean;
}

/**
 * Textarea is a multi-line text input field.
 *
 * @example
 * <Textarea placeholder="Enter your message..." rows={4} />
 *
 * @example
 * // With error state
 * <Textarea error placeholder="Please provide more details" />
 *
 * @example
 * // Non-resizable
 * <Textarea resizable={false} rows={6} />
 */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ size = "md", error = false, resizable = true, className, disabled, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(styles.root, className)}
        disabled={disabled}
        {...dataAttrs({ size, error, resizable })}
        {...props}
      />
    );
  },
);

Textarea.displayName = "Textarea";
