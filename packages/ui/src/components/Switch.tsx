"use client";

import type { ComponentPropsWithoutRef } from "react";
import { forwardRef, useId, useState } from "react";
import { cn, dataAttrs } from "../utils/cn";
import styles from "./Switch.module.css";

export interface SwitchProps extends Omit<ComponentPropsWithoutRef<"button">, "onChange"> {
  /**
   * The controlled checked state
   */
  checked?: boolean;
  /**
   * The default checked state (uncontrolled)
   */
  defaultChecked?: boolean;
  /**
   * Callback when checked state changes
   */
  onCheckedChange?: (checked: boolean) => void;
  /**
   * Size of the switch
   * @default "md"
   */
  size?: "sm" | "md" | "lg";
  /**
   * Accessible name (use when no visible label)
   */
  "aria-label"?: string;
}

/**
 * Switch is a toggle control for binary on/off settings.
 *
 * @example
 * const [enabled, setEnabled] = useState(false);
 * <Switch checked={enabled} onCheckedChange={setEnabled} aria-label="Enable notifications" />
 *
 * @example
 * // Uncontrolled
 * <Switch defaultChecked={true} aria-label="Dark mode" />
 */
export const Switch = forwardRef<HTMLButtonElement, SwitchProps>(
  (
    {
      checked,
      defaultChecked = false,
      onCheckedChange,
      size = "md",
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
    const [internalChecked, setInternalChecked] = useState(defaultChecked);
    const isChecked = isControlled ? checked : internalChecked;

    const handleClick = () => {
      if (disabled) return;

      const newChecked = !isChecked;
      if (!isControlled) {
        setInternalChecked(newChecked);
      }
      onCheckedChange?.(newChecked);
    };

    return (
      <button
        ref={ref}
        type="button"
        role="switch"
        id={id}
        aria-checked={isChecked}
        data-state={isChecked ? "checked" : "unchecked"}
        className={cn(styles.root, className)}
        disabled={disabled}
        onClick={handleClick}
        {...dataAttrs({ size })}
        {...props}
      >
        <span className={styles.thumb} />
      </button>
    );
  },
);

Switch.displayName = "Switch";
