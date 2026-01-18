"use client";

import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { forwardRef } from "react";
import { cn, dataAttrs } from "../utils/cn";
import styles from "./Input.module.css";

export interface InputProps extends Omit<ComponentPropsWithoutRef<"input">, "size"> {
  /**
   * Size of the input
   * @default "md"
   */
  size?: "sm" | "md" | "lg";
  /**
   * Whether the input is in error state
   */
  error?: boolean;
  /**
   * Icon or element to display at the start
   */
  startAdornment?: ReactNode;
  /**
   * Icon or element to display at the end
   */
  endAdornment?: ReactNode;
}

/**
 * Input is a text field for user input.
 *
 * @example
 * <Input placeholder="Enter your email" type="email" />
 *
 * @example
 * // With error state
 * <Input error placeholder="Invalid input" />
 *
 * @example
 * // With adornments
 * <Input
 *   startAdornment={<SearchIcon />}
 *   endAdornment={<ClearButton />}
 *   placeholder="Search..."
 * />
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    { size = "md", error = false, startAdornment, endAdornment, className, disabled, ...props },
    ref,
  ) => {
    const hasAdornments = startAdornment || endAdornment;

    if (hasAdornments) {
      return (
        <div className={cn(styles.wrapper, className)} {...dataAttrs({ size, error, disabled })}>
          {startAdornment && <span className={styles.startAdornment}>{startAdornment}</span>}
          <input ref={ref} className={styles.inputWithAdornment} disabled={disabled} {...props} />
          {endAdornment && <span className={styles.endAdornment}>{endAdornment}</span>}
        </div>
      );
    }

    return (
      <input
        ref={ref}
        className={cn(styles.root, className)}
        disabled={disabled}
        {...dataAttrs({ size, error })}
        {...props}
      />
    );
  },
);

Input.displayName = "Input";
