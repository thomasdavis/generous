"use client";

import {
  type ComponentPropsWithoutRef,
  createContext,
  forwardRef,
  type ReactNode,
  useCallback,
  useContext,
  useId,
  useRef,
  useState,
} from "react";
import { cn, dataAttrs } from "../utils/cn";
import styles from "./Accordion.module.css";

/* ============================================
 * CONTEXT
 * ============================================ */

interface AccordionContextValue {
  type: "single" | "multiple";
  value: string[];
  onValueChange: (value: string) => void;
  collapsible: boolean;
}

const AccordionContext = createContext<AccordionContextValue | null>(null);

function useAccordion() {
  const context = useContext(AccordionContext);
  if (!context) {
    throw new Error("Accordion components must be used within Accordion.Root");
  }
  return context;
}

interface AccordionItemContextValue {
  value: string;
  triggerId: string;
  contentId: string;
  open: boolean;
}

const AccordionItemContext = createContext<AccordionItemContextValue | null>(null);

function useAccordionItem() {
  const context = useContext(AccordionItemContext);
  if (!context) {
    throw new Error("Accordion.Trigger/Content must be used within Accordion.Item");
  }
  return context;
}

/* ============================================
 * ROOT
 * ============================================ */

type AccordionRootSingleProps = {
  type: "single";
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  collapsible?: boolean;
};

type AccordionRootMultipleProps = {
  type: "multiple";
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
};

type AccordionRootProps = ComponentPropsWithoutRef<"div"> &
  (AccordionRootSingleProps | AccordionRootMultipleProps) & {
    children?: ReactNode;
  };

const AccordionRoot = forwardRef<HTMLDivElement, AccordionRootProps>(
  (
    { type, value: controlledValue, defaultValue, onValueChange, children, className, ...props },
    ref,
  ) => {
    const collapsible =
      type === "single" ? ((props as AccordionRootSingleProps).collapsible ?? false) : true;

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
        if (type === "single") {
          const newValue = value.includes(itemValue) ? (collapsible ? [] : value) : [itemValue];
          if (!isControlled) {
            setInternalValue(newValue);
          }
          (onValueChange as ((value: string) => void) | undefined)?.(newValue[0] || "");
        } else {
          const newValue = value.includes(itemValue)
            ? value.filter((v) => v !== itemValue)
            : [...value, itemValue];
          if (!isControlled) {
            setInternalValue(newValue);
          }
          (onValueChange as ((value: string[]) => void) | undefined)?.(newValue);
        }
      },
      [type, value, collapsible, isControlled, onValueChange],
    );

    return (
      <AccordionContext.Provider
        value={{ type, value, onValueChange: handleValueChange, collapsible }}
      >
        <div ref={ref} className={cn(styles.root, className)} {...props}>
          {children}
        </div>
      </AccordionContext.Provider>
    );
  },
);

AccordionRoot.displayName = "Accordion.Root";

/* ============================================
 * ITEM
 * ============================================ */

export interface AccordionItemProps extends ComponentPropsWithoutRef<"div"> {
  value: string;
  disabled?: boolean;
  children?: ReactNode;
}

const AccordionItem = forwardRef<HTMLDivElement, AccordionItemProps>(
  ({ value, disabled = false, children, className, ...props }, ref) => {
    const { value: openValues } = useAccordion();
    const id = useId();
    const triggerId = `accordion-trigger-${id}`;
    const contentId = `accordion-content-${id}`;
    const open = openValues.includes(value);

    return (
      <AccordionItemContext.Provider value={{ value, triggerId, contentId, open }}>
        <div
          ref={ref}
          data-state={open ? "open" : "closed"}
          className={cn(styles.item, className)}
          {...dataAttrs({ disabled })}
          {...props}
        >
          {children}
        </div>
      </AccordionItemContext.Provider>
    );
  },
);

AccordionItem.displayName = "Accordion.Item";

/* ============================================
 * TRIGGER
 * ============================================ */

export interface AccordionTriggerProps extends ComponentPropsWithoutRef<"button"> {
  children?: ReactNode;
}

const AccordionTrigger = forwardRef<HTMLButtonElement, AccordionTriggerProps>(
  ({ children, className, onClick, ...props }, ref) => {
    const { onValueChange } = useAccordion();
    const { value, triggerId, contentId, open } = useAccordionItem();

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      onValueChange(value);
      onClick?.(e);
    };

    return (
      <h3 className={styles.header}>
        <button
          ref={ref}
          type="button"
          id={triggerId}
          aria-expanded={open}
          aria-controls={contentId}
          data-state={open ? "open" : "closed"}
          className={cn(styles.trigger, className)}
          onClick={handleClick}
          {...props}
        >
          <span className={styles.triggerText}>{children}</span>
          <span className={styles.triggerIcon} aria-hidden="true">
            <svg aria-hidden="true" viewBox="0 0 16 16" fill="none" className={styles.chevron}>
              <path
                d="M4 6l4 4 4-4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </button>
      </h3>
    );
  },
);

AccordionTrigger.displayName = "Accordion.Trigger";

/* ============================================
 * CONTENT
 * ============================================ */

export interface AccordionContentProps extends ComponentPropsWithoutRef<"div"> {
  forceMount?: boolean;
  children?: ReactNode;
}

const AccordionContent = forwardRef<HTMLDivElement, AccordionContentProps>(
  ({ forceMount = false, children, className, ...props }, ref) => {
    const { triggerId, contentId, open } = useAccordionItem();
    const contentRef = useRef<HTMLDivElement>(null);

    if (!open && !forceMount) {
      return null;
    }

    return (
      <div
        ref={(node) => {
          contentRef.current = node;
          if (typeof ref === "function") ref(node);
          else if (ref) ref.current = node;
        }}
        id={contentId}
        role="region"
        aria-labelledby={triggerId}
        data-state={open ? "open" : "closed"}
        className={cn(styles.content, className)}
        hidden={!open}
        {...props}
      >
        <div className={styles.contentInner}>{children}</div>
      </div>
    );
  },
);

AccordionContent.displayName = "Accordion.Content";

/* ============================================
 * EXPORTS
 * ============================================ */

export const Accordion = {
  Root: AccordionRoot,
  Item: AccordionItem,
  Trigger: AccordionTrigger,
  Content: AccordionContent,
};

export type { AccordionRootProps };
