"use client";

import {
  type ComponentPropsWithoutRef,
  createContext,
  forwardRef,
  type ReactNode,
  useCallback,
  useContext,
  useId,
  useState,
} from "react";
import { cn, dataAttrs } from "../utils/cn";
import styles from "./Tabs.module.css";

/* ============================================
 * CONTEXT
 * ============================================ */

interface TabsContextValue {
  value: string;
  setValue: (value: string) => void;
  baseId: string;
  orientation: "horizontal" | "vertical";
}

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabs() {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error("Tabs components must be used within Tabs.Root");
  }
  return context;
}

/* ============================================
 * ROOT
 * ============================================ */

export interface TabsRootProps extends ComponentPropsWithoutRef<"div"> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  orientation?: "horizontal" | "vertical";
  children?: ReactNode;
}

const TabsRoot = forwardRef<HTMLDivElement, TabsRootProps>(
  (
    {
      value: controlledValue,
      defaultValue = "",
      onValueChange,
      orientation = "horizontal",
      children,
      className,
      ...props
    },
    ref,
  ) => {
    const [internalValue, setInternalValue] = useState(defaultValue);
    const isControlled = controlledValue !== undefined;
    const value = isControlled ? controlledValue : internalValue;
    const baseId = useId();

    const setValue = useCallback(
      (newValue: string) => {
        if (!isControlled) {
          setInternalValue(newValue);
        }
        onValueChange?.(newValue);
      },
      [isControlled, onValueChange],
    );

    return (
      <TabsContext.Provider value={{ value, setValue, baseId, orientation }}>
        <div
          ref={ref}
          className={cn(styles.root, className)}
          {...dataAttrs({ orientation })}
          {...props}
        >
          {children}
        </div>
      </TabsContext.Provider>
    );
  },
);

TabsRoot.displayName = "Tabs.Root";

/* ============================================
 * LIST
 * ============================================ */

export interface TabsListProps extends ComponentPropsWithoutRef<"div"> {
  children?: ReactNode;
}

const TabsList = forwardRef<HTMLDivElement, TabsListProps>(
  ({ children, className, ...props }, ref) => {
    const { orientation } = useTabs();

    return (
      <div
        ref={ref}
        role="tablist"
        aria-orientation={orientation}
        className={cn(styles.list, className)}
        {...dataAttrs({ orientation })}
        {...props}
      >
        {children}
      </div>
    );
  },
);

TabsList.displayName = "Tabs.List";

/* ============================================
 * TRIGGER
 * ============================================ */

export interface TabsTriggerProps extends ComponentPropsWithoutRef<"button"> {
  value: string;
  disabled?: boolean;
  children?: ReactNode;
}

const TabsTrigger = forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ value: tabValue, disabled = false, children, className, onClick, ...props }, ref) => {
    const { value, setValue, baseId } = useTabs();
    const isSelected = value === tabValue;

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (!disabled) {
        setValue(tabValue);
      }
      onClick?.(e);
    };

    return (
      <button
        ref={ref}
        type="button"
        role="tab"
        id={`${baseId}-tab-${tabValue}`}
        aria-selected={isSelected}
        aria-controls={`${baseId}-panel-${tabValue}`}
        tabIndex={isSelected ? 0 : -1}
        disabled={disabled}
        data-state={isSelected ? "active" : "inactive"}
        className={cn(styles.trigger, className)}
        onClick={handleClick}
        {...dataAttrs({ disabled })}
        {...props}
      >
        {children}
      </button>
    );
  },
);

TabsTrigger.displayName = "Tabs.Trigger";

/* ============================================
 * CONTENT
 * ============================================ */

export interface TabsContentProps extends ComponentPropsWithoutRef<"div"> {
  value: string;
  forceMount?: boolean;
  children?: ReactNode;
}

const TabsContent = forwardRef<HTMLDivElement, TabsContentProps>(
  ({ value: tabValue, forceMount = false, children, className, ...props }, ref) => {
    const { value, baseId } = useTabs();
    const isSelected = value === tabValue;

    if (!isSelected && !forceMount) {
      return null;
    }

    return (
      <div
        ref={ref}
        role="tabpanel"
        id={`${baseId}-panel-${tabValue}`}
        aria-labelledby={`${baseId}-tab-${tabValue}`}
        data-state={isSelected ? "active" : "inactive"}
        className={cn(styles.content, className)}
        hidden={!isSelected}
        {...props}
      >
        {children}
      </div>
    );
  },
);

TabsContent.displayName = "Tabs.Content";

/* ============================================
 * EXPORTS
 * ============================================ */

export const Tabs = {
  Root: TabsRoot,
  List: TabsList,
  Trigger: TabsTrigger,
  Content: TabsContent,
};
