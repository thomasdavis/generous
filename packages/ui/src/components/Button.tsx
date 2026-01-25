"use client";

import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { forwardRef } from "react";
import { cn, dataAttrs } from "../utils/cn";
import styles from "./Button.module.css";
import { Slot } from "./Slot";

export interface ButtonProps extends ComponentPropsWithoutRef<"button"> {
  /**
   * Visual style variant
   * @default "primary"
   */
  variant?: "primary" | "secondary" | "ghost" | "destructive" | "outline";
  /**
   * Size of the button
   * @default "md"
   */
  size?: "sm" | "md" | "lg" | "icon";
  /**
   * Whether the button takes full width of its container
   * @default false
   */
  fullWidth?: boolean;
  /**
   * Whether to render as child element (using Slot)
   * @default false
   */
  asChild?: boolean;
  /**
   * Whether the button is in a loading state
   * @default false
   */
  loading?: boolean;
  /**
   * Icon to display before the button text
   */
  iconLeft?: ReactNode;
  /**
   * Icon to display after the button text
   */
  iconRight?: ReactNode;
  /**
   * Button content
   */
  children?: ReactNode;
}

/**
 * Button component for triggering actions.
 *
 * @example
 * <Button>Click me</Button>
 *
 * @example
 * <Button variant="secondary" size="lg">
 *   Large Secondary
 * </Button>
 *
 * @example
 * // With icons
 * <Button iconLeft={<PlusIcon />}>Add item</Button>
 *
 * @example
 * // Loading state
 * <Button loading>Saving...</Button>
 *
 * @example
 * // Render as link
 * <Button asChild>
 *   <a href="/home">Go Home</a>
 * </Button>
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      fullWidth = false,
      asChild = false,
      loading = false,
      iconLeft,
      iconRight,
      children,
      className,
      disabled,
      ...props
    },
    ref,
  ) => {
    const isDisabled = disabled || loading;

    const sharedProps = {
      ref,
      className: cn(styles.root, className),
      ...dataAttrs({
        variant,
        size,
        "full-width": fullWidth,
        loading,
      }),
      ...props,
    };

    // When asChild is true, pass the single child directly to Slot
    // The child element receives the button's styling props
    if (asChild) {
      return (
        <Slot {...sharedProps} disabled={isDisabled}>
          {children}
        </Slot>
      );
    }

    // Standard button rendering with icons and loading state
    return (
      <button {...sharedProps} disabled={isDisabled}>
        {loading && (
          <span className={styles.spinner} aria-hidden="true">
            <svg aria-hidden="true" viewBox="0 0 24 24" className={styles.spinnerIcon}>
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="3"
                fill="none"
                strokeLinecap="round"
                strokeDasharray="31.4 31.4"
              />
            </svg>
          </span>
        )}
        {!loading && iconLeft && (
          <span className={styles.iconLeft} aria-hidden="true">
            {iconLeft}
          </span>
        )}
        {children && <span className={styles.text}>{children}</span>}
        {!loading && iconRight && (
          <span className={styles.iconRight} aria-hidden="true">
            {iconRight}
          </span>
        )}
      </button>
    );
  },
);

Button.displayName = "Button";
