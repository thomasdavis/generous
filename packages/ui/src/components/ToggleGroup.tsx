"use client";

import {
  type ComponentPropsWithoutRef,
  createContext,
  forwardRef,
  type ReactNode,
  useCallback,
  useContext,
  useState,
} from "react";
import { cn, dataAttrs } from "../utils/cn";
import styles from "./ToggleGroup.module.css";

/* ============================================
 * CONTEXT
 * ============================================ */

interface ToggleGroupContextValue {
  value: string[];
  onValueChange: (value: string) => void;
  type: "single" | "multiple";
  variant: "default" | "outline";
  size: "sm" | "md" | "lg";
  disabled: boolean;
}

const ToggleGroupContext = createContext<ToggleGroupContextValue | null>(null);

function useToggleGroup() {
  const context = useContext(ToggleGroupContext);
  if (!context) {
    throw new Error("ToggleGroup.Item must be used within ToggleGroup.Root");
  }
  return context;
}

/* ============================================
 * ROOT
 * ============================================ */

type ToggleGroupRootSingleProps = {
  type: "single";
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
};

type ToggleGroupRootMultipleProps = {
  type: "multiple";
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
};

type ToggleGroupRootProps = ComponentPropsWithoutRef<"div"> &
  (ToggleGroupRootSingleProps | ToggleGroupRootMultipleProps) & {
    /**
     * Visual style variant
     * @default "default"
     */
    variant?: "default" | "outline";
    /**
     * Size of the toggles
     * @default "md"
     */
    size?: "sm" | "md" | "lg";
    /**
     * Whether all items are disabled
     */
    disabled?: boolean;
    /**
     * Orientation for keyboard navigation
     * @default "horizontal"
     */
    orientation?: "horizontal" | "vertical";
    children?: ReactNode;
  };

const ToggleGroupRoot = forwardRef<HTMLDivElement, ToggleGroupRootProps>(
  (
    {
      type,
      value: controlledValue,
      defaultValue,
      onValueChange,
      variant = "default",
      size = "md",
      disabled = false,
      orientation = "horizontal",
      children,
      className,
      ...props
    },
    ref,
  ) => {
    // Handle controlled vs uncontrolled state
    const [internalValue, setInternalValue] = useState<string[]>(() => {
      if (type === "single") {
        return defaultValue ? [defaultValue as string] : [];
      }
      return (defaultValue as string[]) || [];
    });

    const isControlled = controlledValue !== undefined;
    const value = isControlled
      ? type === "single"
        ? controlledValue
          ? [controlledValue as string]
          : []
        : (controlledValue as string[])
      : internalValue;

    const handleValueChange = useCallback(
      (itemValue: string) => {
        let newValue: string[];

        if (type === "single") {
          // Single select - toggle or select
          newValue = value.includes(itemValue) ? [] : [itemValue];
          if (!isControlled) {
            setInternalValue(newValue);
          }
          (onValueChange as ((value: string) => void) | undefined)?.(newValue[0] || "");
        } else {
          // Multiple select - toggle item
          newValue = value.includes(itemValue)
            ? value.filter((v) => v !== itemValue)
            : [...value, itemValue];
          if (!isControlled) {
            setInternalValue(newValue);
          }
          (onValueChange as ((value: string[]) => void) | undefined)?.(newValue);
        }
      },
      [type, value, isControlled, onValueChange],
    );

    return (
      <ToggleGroupContext.Provider
        value={{
          value,
          onValueChange: handleValueChange,
          type,
          variant,
          size,
          disabled,
        }}
      >
        <div
          ref={ref}
          role="group"
          className={cn(styles.root, className)}
          {...dataAttrs({ orientation, variant })}
          {...props}
        >
          {children}
        </div>
      </ToggleGroupContext.Provider>
    );
  },
);

ToggleGroupRoot.displayName = "ToggleGroup.Root";

/* ============================================
 * ITEM
 * ============================================ */

interface ToggleGroupItemProps extends ComponentPropsWithoutRef<"button"> {
  /**
   * The value of this item
   */
  value: string;
  /**
   * Item content
   */
  children?: ReactNode;
}

const ToggleGroupItem = forwardRef<HTMLButtonElement, ToggleGroupItemProps>(
  ({ value, children, className, disabled: itemDisabled, ...props }, ref) => {
    const {
      value: groupValue,
      onValueChange,
      variant,
      size,
      disabled: groupDisabled,
    } = useToggleGroup();

    const isPressed = groupValue.includes(value);
    const isDisabled = itemDisabled || groupDisabled;

    return (
      <button
        ref={ref}
        type="button"
        aria-pressed={isPressed}
        data-state={isPressed ? "on" : "off"}
        className={cn(styles.item, className)}
        disabled={isDisabled}
        onClick={() => onValueChange(value)}
        {...dataAttrs({ variant, size })}
        {...props}
      >
        {children}
      </button>
    );
  },
);

ToggleGroupItem.displayName = "ToggleGroup.Item";

/* ============================================
 * EXPORTS
 * ============================================ */

export const ToggleGroup = {
  Root: ToggleGroupRoot,
  Item: ToggleGroupItem,
};

export type { ToggleGroupRootProps, ToggleGroupItemProps };
