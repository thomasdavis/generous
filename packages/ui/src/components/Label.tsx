"use client";

import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { forwardRef } from "react";
import { cn, dataAttrs } from "../utils/cn";
import styles from "./Label.module.css";

export interface LabelProps extends ComponentPropsWithoutRef<"label"> {
  /**
   * Size of the label
   * @default "md"
   */
  size?: "sm" | "md" | "lg";
  /**
   * Whether to display as uppercase with wide tracking
   * @default false
   */
  uppercase?: boolean;
  /**
   * Whether the associated field is required
   * @default false
   */
  required?: boolean;
  /**
   * Label content
   */
  children?: ReactNode;
}

/**
 * Label provides a caption for form elements.
 *
 * @example
 * <Label htmlFor="email">Email</Label>
 * <Input id="email" type="email" />
 *
 * @example
 * // Uppercase style (per design system)
 * <Label uppercase>EMAIL ADDRESS</Label>
 *
 * @example
 * // Required field
 * <Label required>Password</Label>
 */
export const Label = forwardRef<HTMLLabelElement, LabelProps>(
  ({ size = "md", uppercase = false, required = false, children, className, ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={cn(styles.root, className)}
        {...dataAttrs({ size, uppercase })}
        {...props}
      >
        {children}
        {required && (
          <span className={styles.required} aria-hidden="true">
            *
          </span>
        )}
      </label>
    );
  },
);

Label.displayName = "Label";
