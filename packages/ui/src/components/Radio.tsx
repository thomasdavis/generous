"use client";

import type { ComponentPropsWithoutRef } from "react";
import { forwardRef } from "react";
import { cn, dataAttrs } from "../utils/cn";
import styles from "./Radio.module.css";

export interface RadioProps extends Omit<ComponentPropsWithoutRef<"button">, "onChange"> {
  /**
   * Whether this radio is selected
   */
  checked?: boolean;
  /**
   * Value of this radio option
   */
  value: string;
  /**
   * Size of the radio
   * @default "md"
   */
  size?: "sm" | "md" | "lg";
  /**
   * Whether the radio is in error state
   */
  error?: boolean;
}

/**
 * Radio is a single radio button. Use within RadioGroup for proper behavior.
 *
 * @example
 * <RadioGroup value={value} onValueChange={setValue}>
 *   <Radio value="option1" />
 *   <Radio value="option2" />
 * </RadioGroup>
 */
export const Radio = forwardRef<HTMLButtonElement, RadioProps>(
  ({ checked = false, value, size = "md", error = false, disabled, className, ...props }, ref) => {
    return (
      <button
        ref={ref}
        type="button"
        role="radio"
        aria-checked={checked}
        data-state={checked ? "checked" : "unchecked"}
        className={cn(styles.root, className)}
        disabled={disabled}
        {...dataAttrs({ size, error })}
        {...props}
      >
        <span className={styles.indicator} aria-hidden="true">
          {checked && <span className={styles.dot} />}
        </span>
      </button>
    );
  },
);

Radio.displayName = "Radio";
