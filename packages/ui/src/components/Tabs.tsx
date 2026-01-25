"use client";

import { Tabs as BaseTabs } from "@base-ui-components/react/tabs";
import { type ComponentPropsWithoutRef, forwardRef, type ReactNode } from "react";
import { cn, dataAttrs } from "../utils/cn";
import styles from "./Tabs.module.css";

/* ============================================
 * ROOT
 * ============================================ */

export interface TabsRootProps extends Omit<ComponentPropsWithoutRef<"div">, "defaultValue"> {
  /**
   * Controlled value
   */
  value?: string | number;
  /**
   * Default value (uncontrolled)
   */
  defaultValue?: string | number;
  /**
   * Callback when value changes
   */
  onValueChange?: (value: string | number) => void;
  /**
   * Orientation of the tabs
   * @default "horizontal"
   */
  orientation?: "horizontal" | "vertical";
  children?: ReactNode;
}

const TabsRoot = forwardRef<HTMLDivElement, TabsRootProps>(
  (
    {
      value,
      defaultValue,
      onValueChange,
      orientation = "horizontal",
      children,
      className,
      ...props
    },
    ref,
  ) => {
    return (
      <BaseTabs.Root
        ref={ref}
        value={value}
        defaultValue={defaultValue}
        onValueChange={(val) => onValueChange?.(val as string | number)}
        orientation={orientation}
        className={cn(styles.root, className)}
        {...dataAttrs({ orientation })}
        {...props}
      >
        {children}
      </BaseTabs.Root>
    );
  },
);

TabsRoot.displayName = "Tabs.Root";

/* ============================================
 * LIST
 * ============================================ */

export interface TabsListProps extends ComponentPropsWithoutRef<"div"> {
  /**
   * Whether to loop keyboard navigation
   * @default true
   */
  loop?: boolean;
  /**
   * Whether to activate tab on focus
   * @default false
   */
  activateOnFocus?: boolean;
  children?: ReactNode;
}

const TabsList = forwardRef<HTMLDivElement, TabsListProps>(
  ({ loop = true, activateOnFocus = false, children, className, ...props }, ref) => {
    return (
      <BaseTabs.List
        ref={ref}
        loopFocus={loop}
        activateOnFocus={activateOnFocus}
        className={cn(styles.list, className)}
        {...props}
      >
        {children}
      </BaseTabs.List>
    );
  },
);

TabsList.displayName = "Tabs.List";

/* ============================================
 * TRIGGER
 * ============================================ */

export interface TabsTriggerProps extends Omit<ComponentPropsWithoutRef<"button">, "value"> {
  /**
   * Value of this tab
   */
  value: string | number;
  /**
   * Whether this tab is disabled
   */
  disabled?: boolean;
  children?: ReactNode;
}

const TabsTrigger = forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ value, disabled = false, children, className, ...props }, ref) => {
    return (
      <BaseTabs.Tab
        ref={ref}
        value={value}
        disabled={disabled}
        className={cn(styles.trigger, className)}
        {...props}
      >
        {children}
      </BaseTabs.Tab>
    );
  },
);

TabsTrigger.displayName = "Tabs.Trigger";

/* ============================================
 * CONTENT (PANEL)
 * ============================================ */

export interface TabsContentProps extends Omit<ComponentPropsWithoutRef<"div">, "value"> {
  /**
   * Value of the tab this content belongs to
   */
  value: string | number;
  /**
   * Keep content mounted when inactive
   * @default false
   */
  keepMounted?: boolean;
  /**
   * @deprecated Use keepMounted instead
   */
  forceMount?: boolean;
  children?: ReactNode;
}

const TabsContent = forwardRef<HTMLDivElement, TabsContentProps>(
  ({ value, keepMounted, forceMount, children, className, ...props }, ref) => {
    return (
      <BaseTabs.Panel
        ref={ref}
        value={value}
        keepMounted={keepMounted ?? forceMount}
        className={cn(styles.content, className)}
        {...props}
      >
        {children}
      </BaseTabs.Panel>
    );
  },
);

TabsContent.displayName = "Tabs.Content";

/* ============================================
 * INDICATOR
 * ============================================ */

export interface TabsIndicatorProps extends ComponentPropsWithoutRef<"span"> {
  children?: ReactNode;
}

const TabsIndicator = forwardRef<HTMLSpanElement, TabsIndicatorProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <BaseTabs.Indicator ref={ref} className={cn(styles.indicator, className)} {...props}>
        {children}
      </BaseTabs.Indicator>
    );
  },
);

TabsIndicator.displayName = "Tabs.Indicator";

/* ============================================
 * EXPORTS
 * ============================================ */

export const Tabs = {
  Root: TabsRoot,
  List: TabsList,
  Trigger: TabsTrigger,
  Content: TabsContent,
  Indicator: TabsIndicator,
};
