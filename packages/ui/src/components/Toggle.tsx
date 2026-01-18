"use client";

import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { forwardRef } from "react";
import { cn, dataAttrs } from "../utils/cn";
import styles from "./Toggle.module.css";

export interface ToggleProps extends Omit<ComponentPropsWithoutRef<"button">, "onChange"> {
  /**
   * The controlled pressed state
   */
  pressed?: boolean;
  /**
   * The default pressed state (uncontrolled)
   */
  defaultPressed?: boolean;
  /**
   * Callback when pressed state changes
   */
  onPressedChange?: (pressed: boolean) => void;
  /**
   * Visual style variant
   * @default "default"
   */
  variant?: "default" | "outline";
  /**
   * Size of the toggle
   * @default "md"
   */
  size?: "sm" | "md" | "lg";
  /**
   * Toggle content (usually an icon)
   */
  children?: ReactNode;
}

/**
 * Toggle is a two-state button that can be either on or off.
 * Commonly used for toolbar buttons or settings toggles.
 *
 * @example
 * const [bold, setBold] = useState(false);
 * <Toggle pressed={bold} onPressedChange={setBold}>
 *   <BoldIcon />
 * </Toggle>
 *
 * @example
 * // Uncontrolled
 * <Toggle defaultPressed={true} aria-label="Toggle italic">
 *   <ItalicIcon />
 * </Toggle>
 */
export const Toggle = forwardRef<HTMLButtonElement, ToggleProps>(
  (
    {
      pressed,
      defaultPressed = false,
      onPressedChange,
      variant = "default",
      size = "md",
      children,
      className,
      disabled,
      onClick,
      ...props
    },
    ref,
  ) => {
    // Handle uncontrolled state
    const isControlled = pressed !== undefined;
    const [internalPressed, setInternalPressed] = useState(defaultPressed);
    const isPressed = isControlled ? pressed : internalPressed;

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      if (!isControlled) {
        setInternalPressed(!isPressed);
      }
      onPressedChange?.(!isPressed);
      onClick?.(event);
    };

    return (
      <button
        ref={ref}
        type="button"
        aria-pressed={isPressed}
        data-state={isPressed ? "on" : "off"}
        className={cn(styles.root, className)}
        disabled={disabled}
        onClick={handleClick}
        {...dataAttrs({ variant, size })}
        {...props}
      >
        {children}
      </button>
    );
  },
);

Toggle.displayName = "Toggle";

// Need to import useState
import { useState } from "react";
