"use client";

import { Select as BaseSelect } from "@base-ui-components/react/select";
import { type ComponentPropsWithoutRef, forwardRef, type ReactNode } from "react";
import { cn, dataAttrs } from "../utils/cn";
import styles from "./Select.module.css";

/* ============================================
 * ROOT
 * ============================================ */

export interface SelectRootProps {
  /**
   * Controlled value
   */
  value?: string;
  /**
   * Default value (uncontrolled)
   */
  defaultValue?: string;
  /**
   * Callback when value changes
   */
  onValueChange?: (value: string) => void;
  /**
   * Controlled open state
   */
  open?: boolean;
  /**
   * Default open state
   */
  defaultOpen?: boolean;
  /**
   * Callback when open state changes
   */
  onOpenChange?: (open: boolean) => void;
  /**
   * Whether the select is disabled
   */
  disabled?: boolean;
  /**
   * Size of the select
   * @default "md"
   */
  size?: "sm" | "md" | "lg";
  /**
   * Whether the select is in error state
   */
  error?: boolean;
  /**
   * Whether the select is required
   */
  required?: boolean;
  /**
   * Name for form submission
   */
  name?: string;
  children?: ReactNode;
}

function SelectRoot({
  value,
  defaultValue,
  onValueChange,
  open,
  defaultOpen,
  onOpenChange,
  disabled = false,
  size = "md",
  error = false,
  required,
  name,
  children,
}: SelectRootProps) {
  return (
    <BaseSelect.Root
      value={value}
      defaultValue={defaultValue}
      onValueChange={(val) => onValueChange?.(val as string)}
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={(open) => onOpenChange?.(open)}
      disabled={disabled}
      required={required}
      name={name}
    >
      <SelectContext.Provider value={{ size, error }}>{children}</SelectContext.Provider>
    </BaseSelect.Root>
  );
}

SelectRoot.displayName = "Select.Root";

/* ============================================
 * CONTEXT FOR STYLING
 * ============================================ */

import { createContext, useContext } from "react";

interface SelectContextValue {
  size: "sm" | "md" | "lg";
  error: boolean;
}

const SelectContext = createContext<SelectContextValue>({ size: "md", error: false });

function useSelectContext() {
  return useContext(SelectContext);
}

/* ============================================
 * TRIGGER
 * ============================================ */

export interface SelectTriggerProps extends ComponentPropsWithoutRef<"button"> {
  children?: ReactNode;
}

const SelectTrigger = forwardRef<HTMLButtonElement, SelectTriggerProps>(
  ({ children, className, ...props }, ref) => {
    const { size, error } = useSelectContext();

    return (
      <BaseSelect.Trigger
        ref={ref}
        className={cn(styles.trigger, className)}
        {...dataAttrs({ size, error })}
        {...props}
      >
        {children}
      </BaseSelect.Trigger>
    );
  },
);

SelectTrigger.displayName = "Select.Trigger";

/* ============================================
 * VALUE
 * ============================================ */

export interface SelectValueProps extends ComponentPropsWithoutRef<"span"> {
  /**
   * Placeholder text when no value is selected
   */
  placeholder?: string;
}

const SelectValue = forwardRef<HTMLSpanElement, SelectValueProps>(
  ({ placeholder, className, ...props }, ref) => {
    return (
      <BaseSelect.Value ref={ref} className={cn(styles.value, className)} {...props}>
        {(value: unknown) => (value ? String(value) : placeholder || "")}
      </BaseSelect.Value>
    );
  },
);

SelectValue.displayName = "Select.Value";

/* ============================================
 * ICON
 * ============================================ */

export interface SelectIconProps extends ComponentPropsWithoutRef<"span"> {
  children?: ReactNode;
}

const SelectIcon = forwardRef<HTMLSpanElement, SelectIconProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <BaseSelect.Icon ref={ref} className={cn(styles.icon, className)} {...props}>
        {children || (
          <svg aria-hidden="true" viewBox="0 0 16 16" fill="none" className={styles.chevron}>
            <path
              d="M4 6l4 4 4-4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </BaseSelect.Icon>
    );
  },
);

SelectIcon.displayName = "Select.Icon";

/* ============================================
 * PORTAL
 * ============================================ */

export interface SelectPortalProps {
  children?: ReactNode;
  container?: HTMLElement | null;
}

function SelectPortal({ children, container }: SelectPortalProps) {
  return <BaseSelect.Portal container={container}>{children}</BaseSelect.Portal>;
}

SelectPortal.displayName = "Select.Portal";

/* ============================================
 * POSITIONER
 * ============================================ */

export interface SelectPositionerProps extends ComponentPropsWithoutRef<"div"> {
  /**
   * Preferred side
   * @default "bottom"
   */
  side?: "top" | "bottom";
  /**
   * Preferred alignment
   * @default "start"
   */
  align?: "start" | "center" | "end";
  /**
   * Side offset from trigger
   * @default 4
   */
  sideOffset?: number;
  children?: ReactNode;
}

const SelectPositioner = forwardRef<HTMLDivElement, SelectPositionerProps>(
  ({ side = "bottom", align = "start", sideOffset = 4, children, className, ...props }, ref) => {
    return (
      <BaseSelect.Positioner
        ref={ref}
        side={side}
        align={align}
        sideOffset={sideOffset}
        className={cn(styles.positioner, className)}
        {...props}
      >
        {children}
      </BaseSelect.Positioner>
    );
  },
);

SelectPositioner.displayName = "Select.Positioner";

/* ============================================
 * CONTENT (POPUP)
 * ============================================ */

export interface SelectContentProps extends ComponentPropsWithoutRef<"div"> {
  /**
   * Alignment relative to trigger
   * @default "start"
   * @deprecated Use SelectPositioner align prop instead
   */
  align?: "start" | "center" | "end";
  /**
   * Side offset from trigger
   * @default 4
   * @deprecated Use SelectPositioner sideOffset prop instead
   */
  sideOffset?: number;
  children?: ReactNode;
}

const SelectContent = forwardRef<HTMLDivElement, SelectContentProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <BaseSelect.Popup ref={ref} className={cn(styles.content, className)} {...props}>
        {children}
      </BaseSelect.Popup>
    );
  },
);

SelectContent.displayName = "Select.Content";

/* ============================================
 * ITEM
 * ============================================ */

export interface SelectItemProps extends ComponentPropsWithoutRef<"div"> {
  /**
   * Value of this item
   */
  value: string;
  /**
   * Text to display (optional, uses children if not provided)
   */
  label?: string;
  /**
   * Whether this item is disabled
   */
  disabled?: boolean;
  children?: ReactNode;
}

const SelectItem = forwardRef<HTMLDivElement, SelectItemProps>(
  ({ value, label, disabled = false, children, className, ...props }, ref) => {
    return (
      <BaseSelect.Item
        ref={ref}
        value={value}
        disabled={disabled}
        className={cn(styles.item, className)}
        {...props}
      >
        <BaseSelect.ItemText className={styles.itemText}>{label || children}</BaseSelect.ItemText>
        <BaseSelect.ItemIndicator className={styles.itemIndicator}>
          <svg aria-hidden="true" viewBox="0 0 16 16" fill="none">
            <path
              d="M3.5 8.5l3 3 6-7"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </BaseSelect.ItemIndicator>
      </BaseSelect.Item>
    );
  },
);

SelectItem.displayName = "Select.Item";

/* ============================================
 * GROUP
 * ============================================ */

export interface SelectGroupProps extends ComponentPropsWithoutRef<"div"> {
  children?: ReactNode;
}

const SelectGroup = forwardRef<HTMLDivElement, SelectGroupProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <BaseSelect.Group ref={ref} className={cn(styles.group, className)} {...props}>
        {children}
      </BaseSelect.Group>
    );
  },
);

SelectGroup.displayName = "Select.Group";

/* ============================================
 * LABEL
 * ============================================ */

export interface SelectLabelProps extends ComponentPropsWithoutRef<"div"> {
  children?: ReactNode;
}

const SelectLabel = forwardRef<HTMLDivElement, SelectLabelProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <BaseSelect.GroupLabel ref={ref} className={cn(styles.label, className)} {...props}>
        {children}
      </BaseSelect.GroupLabel>
    );
  },
);

SelectLabel.displayName = "Select.Label";

/* ============================================
 * SEPARATOR
 * ============================================ */

export interface SelectSeparatorProps extends ComponentPropsWithoutRef<"div"> {}

const SelectSeparator = forwardRef<HTMLDivElement, SelectSeparatorProps>(
  ({ className, ...props }, ref) => {
    return (
      <div ref={ref} role="separator" className={cn(styles.separator, className)} {...props} />
    );
  },
);

SelectSeparator.displayName = "Select.Separator";

/* ============================================
 * EXPORTS
 * ============================================ */

export const Select = {
  Root: SelectRoot,
  Trigger: SelectTrigger,
  Value: SelectValue,
  Icon: SelectIcon,
  Portal: SelectPortal,
  Positioner: SelectPositioner,
  Content: SelectContent,
  Item: SelectItem,
  Group: SelectGroup,
  Label: SelectLabel,
  Separator: SelectSeparator,
};
