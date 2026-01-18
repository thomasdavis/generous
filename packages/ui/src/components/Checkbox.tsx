"use client";

import type { ComponentPropsWithoutRef } from "react";
import { forwardRef, useId, useState } from "react";
import { cn, dataAttrs } from "../utils/cn";
import styles from "./Checkbox.module.css";

export interface CheckboxProps extends Omit<ComponentPropsWithoutRef<"button">, "onChange"> {
  /**
   * The controlled checked state
   */
  checked?: boolean | "indeterminate";
  /**
   * The default checked state (uncontrolled)
   */
  defaultChecked?: boolean;
  /**
   * Callback when checked state changes
   */
  onCheckedChange?: (checked: boolean | "indeterminate") => void;
  /**
   * Size of the checkbox
   * @default "md"
   */
  size?: "sm" | "md" | "lg";
  /**
   * Whether the checkbox is in error state
   */
  error?: boolean;
  /**
   * Accessible name (use when no visible label)
   */
  "aria-label"?: string;
}

/**
 * Checkbox allows users to select one or more items from a set.
 *
 * @example
 * const [checked, setChecked] = useState(false);
 * <Checkbox checked={checked} onCheckedChange={setChecked} aria-label="Accept terms" />
 *
 * @example
 * // With indeterminate state
 * <Checkbox checked="indeterminate" onCheckedChange={setChecked} />
 */
export const Checkbox = forwardRef<HTMLButtonElement, CheckboxProps>(
  (
    {
      checked,
      defaultChecked = false,
      onCheckedChange,
      size = "md",
      error = false,
      disabled,
      className,
      id: providedId,
      ...props
    },
    ref,
  ) => {
    const generatedId = useId();
    const id = providedId || generatedId;

    // Handle uncontrolled state
    const isControlled = checked !== undefined;
    const [internalChecked, setInternalChecked] = useState<boolean | "indeterminate">(
      defaultChecked,
    );
    const isChecked = isControlled ? checked : internalChecked;

    const handleClick = () => {
      if (disabled) return;

      const newChecked = isChecked !== true;
      if (!isControlled) {
        setInternalChecked(newChecked);
      }
      onCheckedChange?.(newChecked);
    };

    const dataState =
      isChecked === "indeterminate" ? "indeterminate" : isChecked ? "checked" : "unchecked";

    return (
      <button
        ref={ref}
        type="button"
        role="checkbox"
        id={id}
        aria-checked={isChecked === "indeterminate" ? "mixed" : isChecked}
        data-state={dataState}
        className={cn(styles.root, className)}
        disabled={disabled}
        onClick={handleClick}
        {...dataAttrs({ size, error })}
        {...props}
      >
        <span className={styles.indicator} aria-hidden="true">
          {isChecked === "indeterminate" ? (
            <svg aria-hidden="true" viewBox="0 0 16 16" fill="none" className={styles.icon}>
              <path d="M4 8h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          ) : isChecked ? (
            <svg aria-hidden="true" viewBox="0 0 16 16" fill="none" className={styles.icon}>
              <path
                d="M3.5 8.5l3 3 6-7"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : null}
        </span>
      </button>
    );
  },
);

Checkbox.displayName = "Checkbox";
