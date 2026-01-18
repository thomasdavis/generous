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
import styles from "./Collapsible.module.css";

/* ============================================
 * CONTEXT
 * ============================================ */

interface CollapsibleContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  contentId: string;
  disabled: boolean;
}

const CollapsibleContext = createContext<CollapsibleContextValue | null>(null);

function useCollapsible() {
  const context = useContext(CollapsibleContext);
  if (!context) {
    throw new Error("Collapsible components must be used within Collapsible.Root");
  }
  return context;
}

/* ============================================
 * ROOT
 * ============================================ */

export interface CollapsibleRootProps extends ComponentPropsWithoutRef<"div"> {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
  children?: ReactNode;
}

const CollapsibleRoot = forwardRef<HTMLDivElement, CollapsibleRootProps>(
  (
    {
      open: controlledOpen,
      defaultOpen = false,
      onOpenChange,
      disabled = false,
      children,
      className,
      ...props
    },
    ref,
  ) => {
    const [internalOpen, setInternalOpen] = useState(defaultOpen);
    const isControlled = controlledOpen !== undefined;
    const open = isControlled ? controlledOpen : internalOpen;

    const id = useId();
    const contentId = `collapsible-content-${id}`;

    const setOpen = useCallback(
      (newOpen: boolean) => {
        if (!isControlled) {
          setInternalOpen(newOpen);
        }
        onOpenChange?.(newOpen);
      },
      [isControlled, onOpenChange],
    );

    return (
      <CollapsibleContext.Provider value={{ open, setOpen, contentId, disabled }}>
        <div
          ref={ref}
          data-state={open ? "open" : "closed"}
          className={cn(styles.root, className)}
          {...dataAttrs({ disabled })}
          {...props}
        >
          {children}
        </div>
      </CollapsibleContext.Provider>
    );
  },
);

CollapsibleRoot.displayName = "Collapsible.Root";

/* ============================================
 * TRIGGER
 * ============================================ */

export interface CollapsibleTriggerProps extends ComponentPropsWithoutRef<"button"> {
  children?: ReactNode;
}

const CollapsibleTrigger = forwardRef<HTMLButtonElement, CollapsibleTriggerProps>(
  ({ children, className, onClick, ...props }, ref) => {
    const { open, setOpen, contentId, disabled } = useCollapsible();

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (!disabled) {
        setOpen(!open);
      }
      onClick?.(e);
    };

    return (
      <button
        ref={ref}
        type="button"
        aria-expanded={open}
        aria-controls={contentId}
        data-state={open ? "open" : "closed"}
        disabled={disabled}
        className={cn(styles.trigger, className)}
        onClick={handleClick}
        {...props}
      >
        {children}
      </button>
    );
  },
);

CollapsibleTrigger.displayName = "Collapsible.Trigger";

/* ============================================
 * CONTENT
 * ============================================ */

export interface CollapsibleContentProps extends ComponentPropsWithoutRef<"div"> {
  forceMount?: boolean;
  children?: ReactNode;
}

const CollapsibleContent = forwardRef<HTMLDivElement, CollapsibleContentProps>(
  ({ forceMount = false, children, className, ...props }, ref) => {
    const { open, contentId } = useCollapsible();

    if (!open && !forceMount) {
      return null;
    }

    return (
      <div
        ref={ref}
        id={contentId}
        data-state={open ? "open" : "closed"}
        className={cn(styles.content, className)}
        hidden={!open}
        {...props}
      >
        {children}
      </div>
    );
  },
);

CollapsibleContent.displayName = "Collapsible.Content";

/* ============================================
 * EXPORTS
 * ============================================ */

export const Collapsible = {
  Root: CollapsibleRoot,
  Trigger: CollapsibleTrigger,
  Content: CollapsibleContent,
};
