"use client";

import {
  type ComponentPropsWithoutRef,
  createContext,
  forwardRef,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { cn, dataAttrs } from "../utils/cn";
import { Portal } from "./Portal";
import styles from "./Tooltip.module.css";

/* ============================================
 * CONTEXT
 * ============================================ */

interface TooltipContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  contentId: string;
  triggerRef: React.RefObject<HTMLElement | null>;
  delayDuration: number;
}

const TooltipContext = createContext<TooltipContextValue | null>(null);

function useTooltip() {
  const context = useContext(TooltipContext);
  if (!context) {
    throw new Error("Tooltip components must be used within Tooltip.Root");
  }
  return context;
}

/* ============================================
 * ROOT
 * ============================================ */

export interface TooltipRootProps {
  /**
   * Controlled open state
   */
  open?: boolean;
  /**
   * Default open state (uncontrolled)
   */
  defaultOpen?: boolean;
  /**
   * Callback when open state changes
   */
  onOpenChange?: (open: boolean) => void;
  /**
   * Delay before showing tooltip (ms)
   * @default 400
   */
  delayDuration?: number;
  children?: ReactNode;
}

function TooltipRoot({
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  delayDuration = 400,
  children,
}: TooltipRootProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const triggerRef = useRef<HTMLElement | null>(null);

  const id = useId();
  const contentId = `tooltip-${id}`;

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
    <TooltipContext.Provider value={{ open, setOpen, contentId, triggerRef, delayDuration }}>
      {children}
    </TooltipContext.Provider>
  );
}

TooltipRoot.displayName = "Tooltip.Root";

/* ============================================
 * TRIGGER
 * ============================================ */

export interface TooltipTriggerProps extends ComponentPropsWithoutRef<"span"> {
  children?: ReactNode;
}

const TooltipTrigger = forwardRef<HTMLSpanElement, TooltipTriggerProps>(
  ({ children, className, ...props }, ref) => {
    const { setOpen, contentId, triggerRef, delayDuration, open } = useTooltip();
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const handleMouseEnter = () => {
      timeoutRef.current = setTimeout(() => {
        setOpen(true);
      }, delayDuration);
    };

    const handleMouseLeave = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      setOpen(false);
    };

    const handleFocus = () => {
      setOpen(true);
    };

    const handleBlur = () => {
      setOpen(false);
    };

    // Cleanup timeout on unmount
    useEffect(() => {
      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };
    }, []);

    return (
      <span
        ref={(node) => {
          triggerRef.current = node;
          if (typeof ref === "function") ref(node);
          else if (ref) ref.current = node;
        }}
        aria-describedby={open ? contentId : undefined}
        className={cn(styles.trigger, className)}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocus={handleFocus}
        onBlur={handleBlur}
        {...props}
      >
        {children}
      </span>
    );
  },
);

TooltipTrigger.displayName = "Tooltip.Trigger";

/* ============================================
 * CONTENT
 * ============================================ */

export interface TooltipContentProps extends ComponentPropsWithoutRef<"div"> {
  /**
   * Preferred side
   * @default "top"
   */
  side?: "top" | "right" | "bottom" | "left";
  /**
   * Distance from trigger
   * @default 6
   */
  sideOffset?: number;
  children?: ReactNode;
}

const TooltipContent = forwardRef<HTMLDivElement, TooltipContentProps>(
  ({ side = "top", sideOffset = 6, children, className, style, ...props }, ref) => {
    const { open, contentId, triggerRef } = useTooltip();
    const contentRef = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState({ top: 0, left: 0 });

    // Calculate position
    useEffect(() => {
      if (!open || !triggerRef.current) return;

      const updatePosition = () => {
        const trigger = triggerRef.current;
        if (!trigger) return;

        const rect = trigger.getBoundingClientRect();
        const contentEl = contentRef.current;
        const contentWidth = contentEl?.offsetWidth || 0;
        const contentHeight = contentEl?.offsetHeight || 0;

        let top = 0;
        let left = 0;

        switch (side) {
          case "top":
            top = rect.top - contentHeight - sideOffset;
            left = rect.left + rect.width / 2 - contentWidth / 2;
            break;
          case "bottom":
            top = rect.bottom + sideOffset;
            left = rect.left + rect.width / 2 - contentWidth / 2;
            break;
          case "left":
            top = rect.top + rect.height / 2 - contentHeight / 2;
            left = rect.left - contentWidth - sideOffset;
            break;
          case "right":
            top = rect.top + rect.height / 2 - contentHeight / 2;
            left = rect.right + sideOffset;
            break;
        }

        // Keep in viewport
        const padding = 8;
        left = Math.max(padding, Math.min(left, window.innerWidth - contentWidth - padding));
        top = Math.max(padding, Math.min(top, window.innerHeight - contentHeight - padding));

        setPosition({ top, left });
      };

      updatePosition();
    }, [open, side, sideOffset, triggerRef]);

    if (!open) return null;

    return (
      <Portal>
        <div
          ref={(node) => {
            contentRef.current = node;
            if (typeof ref === "function") ref(node);
            else if (ref) ref.current = node;
          }}
          id={contentId}
          role="tooltip"
          className={cn(styles.content, className)}
          {...dataAttrs({ side })}
          style={{
            ...style,
            position: "fixed",
            top: position.top,
            left: position.left,
          }}
          {...props}
        >
          {children}
        </div>
      </Portal>
    );
  },
);

TooltipContent.displayName = "Tooltip.Content";

/* ============================================
 * EXPORTS
 * ============================================ */

export const Tooltip = {
  Root: TooltipRoot,
  Trigger: TooltipTrigger,
  Content: TooltipContent,
};
