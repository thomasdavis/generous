"use client";

import {
  type ComponentPropsWithoutRef,
  createContext,
  forwardRef,
  type ReactNode,
  useContext,
  useState,
} from "react";
import { cn, dataAttrs } from "../utils/cn";
import styles from "./RadioGroup.module.css";

/* ============================================
 * CONTEXT
 * ============================================ */

interface RadioGroupContextValue {
  value: string;
  onValueChange: (value: string) => void;
  name: string;
  disabled: boolean;
  size: "sm" | "md" | "lg";
  error: boolean;
}

const RadioGroupContext = createContext<RadioGroupContextValue | null>(null);

function useRadioGroup() {
  const context = useContext(RadioGroupContext);
  if (!context) {
    throw new Error("RadioGroup.Item must be used within RadioGroup.Root");
  }
  return context;
}

/* ============================================
 * ROOT
 * ============================================ */

export interface RadioGroupRootProps extends ComponentPropsWithoutRef<"div"> {
  /**
   * The controlled value
   */
  value?: string;
  /**
   * The default value (uncontrolled)
   */
  defaultValue?: string;
  /**
   * Callback when value changes
   */
  onValueChange?: (value: string) => void;
  /**
   * Name attribute for the radio group
   */
  name?: string;
  /**
   * Whether all items are disabled
   */
  disabled?: boolean;
  /**
   * Size of the radio buttons
   * @default "md"
   */
  size?: "sm" | "md" | "lg";
  /**
   * Whether the group is in error state
   */
  error?: boolean;
  /**
   * Layout orientation
   * @default "vertical"
   */
  orientation?: "horizontal" | "vertical";
  children?: ReactNode;
}

const RadioGroupRoot = forwardRef<HTMLDivElement, RadioGroupRootProps>(
  (
    {
      value: controlledValue,
      defaultValue = "",
      onValueChange,
      name = "",
      disabled = false,
      size = "md",
      error = false,
      orientation = "vertical",
      children,
      className,
      ...props
    },
    ref,
  ) => {
    const [internalValue, setInternalValue] = useState(defaultValue);
    const isControlled = controlledValue !== undefined;
    const value = isControlled ? controlledValue : internalValue;

    const handleValueChange = (newValue: string) => {
      if (!isControlled) {
        setInternalValue(newValue);
      }
      onValueChange?.(newValue);
    };

    return (
      <RadioGroupContext.Provider
        value={{
          value,
          onValueChange: handleValueChange,
          name,
          disabled,
          size,
          error,
        }}
      >
        <div
          ref={ref}
          role="radiogroup"
          className={cn(styles.root, className)}
          {...dataAttrs({ orientation })}
          {...props}
        >
          {children}
        </div>
      </RadioGroupContext.Provider>
    );
  },
);

RadioGroupRoot.displayName = "RadioGroup.Root";

/* ============================================
 * ITEM
 * ============================================ */

export interface RadioGroupItemProps extends Omit<ComponentPropsWithoutRef<"button">, "onChange"> {
  /**
   * Value of this radio option
   */
  value: string;
  /**
   * Item content (rendered as label)
   */
  children?: ReactNode;
}

const RadioGroupItem = forwardRef<HTMLButtonElement, RadioGroupItemProps>(
  ({ value, children, className, disabled: itemDisabled, ...props }, ref) => {
    const {
      value: groupValue,
      onValueChange,
      name,
      disabled: groupDisabled,
      size,
      error,
    } = useRadioGroup();

    const isChecked = groupValue === value;
    const isDisabled = itemDisabled || groupDisabled;

    return (
      <label className={styles.itemWrapper}>
        <button
          ref={ref}
          type="button"
          role="radio"
          aria-checked={isChecked}
          data-state={isChecked ? "checked" : "unchecked"}
          className={cn(styles.item, className)}
          disabled={isDisabled}
          onClick={() => onValueChange(value)}
          name={name}
          {...dataAttrs({ size, error })}
          {...props}
        >
          <span className={styles.indicator} aria-hidden="true">
            {isChecked && <span className={styles.dot} />}
          </span>
        </button>
        {children && <span className={styles.label}>{children}</span>}
      </label>
    );
  },
);

RadioGroupItem.displayName = "RadioGroup.Item";

/* ============================================
 * EXPORTS
 * ============================================ */

export const RadioGroup = {
  Root: RadioGroupRoot,
  Item: RadioGroupItem,
};
