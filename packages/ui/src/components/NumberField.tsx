"use client";

import type { ComponentPropsWithoutRef } from "react";
import { forwardRef, useCallback, useState } from "react";
import { cn, dataAttrs } from "../utils/cn";
import styles from "./NumberField.module.css";

export interface NumberFieldProps
  extends Omit<
    ComponentPropsWithoutRef<"input">,
    "type" | "onChange" | "value" | "defaultValue" | "size"
  > {
  /**
   * The controlled value
   */
  value?: number;
  /**
   * The default value (uncontrolled)
   */
  defaultValue?: number;
  /**
   * Callback when value changes
   */
  onValueChange?: (value: number | undefined) => void;
  /**
   * Minimum value
   */
  min?: number;
  /**
   * Maximum value
   */
  max?: number;
  /**
   * Step increment
   * @default 1
   */
  step?: number;
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
   * Whether to show increment/decrement buttons
   * @default true
   */
  showButtons?: boolean;
}

/**
 * NumberField is a numeric input with optional increment/decrement buttons.
 *
 * @example
 * const [quantity, setQuantity] = useState(1);
 * <NumberField value={quantity} onValueChange={setQuantity} min={1} max={10} />
 *
 * @example
 * // Without buttons
 * <NumberField showButtons={false} step={0.5} />
 */
export const NumberField = forwardRef<HTMLInputElement, NumberFieldProps>(
  (
    {
      value: controlledValue,
      defaultValue,
      onValueChange,
      min,
      max,
      step = 1,
      size = "md",
      error = false,
      showButtons = true,
      disabled,
      className,
      ...props
    },
    ref,
  ) => {
    const [internalValue, setInternalValue] = useState<number | undefined>(defaultValue);
    const isControlled = controlledValue !== undefined;
    const value = isControlled ? controlledValue : internalValue;

    const clampValue = useCallback(
      (val: number): number => {
        let result = val;
        if (min !== undefined) result = Math.max(min, result);
        if (max !== undefined) result = Math.min(max, result);
        return result;
      },
      [min, max],
    );

    const updateValue = useCallback(
      (newValue: number | undefined) => {
        const clamped = newValue !== undefined ? clampValue(newValue) : undefined;
        if (!isControlled) {
          setInternalValue(clamped);
        }
        onValueChange?.(clamped);
      },
      [isControlled, clampValue, onValueChange],
    );

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawValue = e.target.value;
      if (rawValue === "") {
        updateValue(undefined);
      } else {
        const parsed = Number.parseFloat(rawValue);
        if (!Number.isNaN(parsed)) {
          updateValue(parsed);
        }
      }
    };

    const increment = () => {
      if (disabled) return;
      updateValue((value ?? 0) + step);
    };

    const decrement = () => {
      if (disabled) return;
      updateValue((value ?? 0) - step);
    };

    const canDecrement = min === undefined || (value ?? 0) > min;
    const canIncrement = max === undefined || (value ?? 0) < max;

    return (
      <div className={cn(styles.root, className)} {...dataAttrs({ size, error, disabled })}>
        {showButtons && (
          <button
            type="button"
            className={styles.button}
            onClick={decrement}
            disabled={disabled || !canDecrement}
            tabIndex={-1}
            aria-label="Decrease value"
          >
            <svg aria-hidden="true" viewBox="0 0 16 16" fill="none" className={styles.icon}>
              <path d="M4 8h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        )}
        <input
          ref={ref}
          type="number"
          inputMode="numeric"
          value={value ?? ""}
          onChange={handleChange}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          className={styles.input}
          {...props}
        />
        {showButtons && (
          <button
            type="button"
            className={styles.button}
            onClick={increment}
            disabled={disabled || !canIncrement}
            tabIndex={-1}
            aria-label="Increase value"
          >
            <svg aria-hidden="true" viewBox="0 0 16 16" fill="none" className={styles.icon}>
              <path d="M8 4v8M4 8h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        )}
      </div>
    );
  },
);

NumberField.displayName = "NumberField";
