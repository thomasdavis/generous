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
import styles from "./Popover.module.css";
import { Portal } from "./Portal";

/* ============================================
 * CONTEXT
 * ============================================ */

interface PopoverContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  triggerId: string;
  contentId: string;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
}

const PopoverContext = createContext<PopoverContextValue | null>(null);

function usePopover() {
  const context = useContext(PopoverContext);
  if (!context) {
    throw new Error("Popover components must be used within Popover.Root");
  }
  return context;
}

/* ============================================
 * ROOT
 * ============================================ */

export interface PopoverRootProps {
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
  children?: ReactNode;
}

function PopoverRoot({
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  children,
}: PopoverRootProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  const id = useId();
  const triggerId = `popover-trigger-${id}`;
  const contentId = `popover-content-${id}`;

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
    <PopoverContext.Provider value={{ open, setOpen, triggerId, contentId, triggerRef }}>
      {children}
    </PopoverContext.Provider>
  );
}

PopoverRoot.displayName = "Popover.Root";

/* ============================================
 * TRIGGER
 * ============================================ */

export interface PopoverTriggerProps extends ComponentPropsWithoutRef<"button"> {
  /**
   * Render as child element
   */
  asChild?: boolean;
  children?: ReactNode;
}

const PopoverTrigger = forwardRef<HTMLButtonElement, PopoverTriggerProps>(
  ({ asChild, children, className, onClick, ...props }, ref) => {
    const { open, setOpen, triggerId, contentId, triggerRef } = usePopover();

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      setOpen(!open);
      onClick?.(e);
    };

    // Merge refs
    const mergedRef = (node: HTMLButtonElement) => {
      triggerRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    };

    return (
      <button
        ref={mergedRef}
        type="button"
        id={triggerId}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? contentId : undefined}
        className={cn(styles.trigger, className)}
        onClick={handleClick}
        {...props}
      >
        {children}
      </button>
    );
  },
);

PopoverTrigger.displayName = "Popover.Trigger";

/* ============================================
 * CONTENT
 * ============================================ */

export interface PopoverContentProps extends ComponentPropsWithoutRef<"div"> {
  /**
   * Preferred alignment
   * @default "center"
   */
  align?: "start" | "center" | "end";
  /**
   * Preferred side
   * @default "bottom"
   */
  side?: "top" | "right" | "bottom" | "left";
  /**
   * Distance from trigger
   * @default 8
   */
  sideOffset?: number;
  children?: ReactNode;
}

const PopoverContent = forwardRef<HTMLDivElement, PopoverContentProps>(
  (
    { align = "center", side = "bottom", sideOffset = 8, children, className, style, ...props },
    ref,
  ) => {
    const { open, setOpen, contentId, triggerRef } = usePopover();
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

        // Calculate based on side
        switch (side) {
          case "top":
            top = rect.top - contentHeight - sideOffset;
            break;
          case "bottom":
            top = rect.bottom + sideOffset;
            break;
          case "left":
            left = rect.left - contentWidth - sideOffset;
            top = rect.top;
            break;
          case "right":
            left = rect.right + sideOffset;
            top = rect.top;
            break;
        }

        // Calculate based on alignment
        if (side === "top" || side === "bottom") {
          switch (align) {
            case "start":
              left = rect.left;
              break;
            case "center":
              left = rect.left + rect.width / 2 - contentWidth / 2;
              break;
            case "end":
              left = rect.right - contentWidth;
              break;
          }
        } else {
          switch (align) {
            case "start":
              top = rect.top;
              break;
            case "center":
              top = rect.top + rect.height / 2 - contentHeight / 2;
              break;
            case "end":
              top = rect.bottom - contentHeight;
              break;
          }
        }

        // Keep in viewport
        const padding = 8;
        left = Math.max(padding, Math.min(left, window.innerWidth - contentWidth - padding));
        top = Math.max(padding, Math.min(top, window.innerHeight - contentHeight - padding));

        setPosition({ top, left });
      };

      updatePosition();
      window.addEventListener("resize", updatePosition);
      window.addEventListener("scroll", updatePosition, true);

      return () => {
        window.removeEventListener("resize", updatePosition);
        window.removeEventListener("scroll", updatePosition, true);
      };
    }, [open, side, align, sideOffset, triggerRef]);

    // Close on outside click
    useEffect(() => {
      if (!open) return;

      const handleClickOutside = (e: MouseEvent) => {
        const target = e.target as Node;
        if (
          contentRef.current &&
          !contentRef.current.contains(target) &&
          triggerRef.current &&
          !triggerRef.current.contains(target)
        ) {
          setOpen(false);
        }
      };

      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          setOpen(false);
          triggerRef.current?.focus();
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);

      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
        document.removeEventListener("keydown", handleEscape);
      };
    }, [open, setOpen, triggerRef]);

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
          role="dialog"
          className={cn(styles.content, className)}
          {...dataAttrs({ side, align })}
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

PopoverContent.displayName = "Popover.Content";

/* ============================================
 * CLOSE
 * ============================================ */

export interface PopoverCloseProps extends ComponentPropsWithoutRef<"button"> {
  children?: ReactNode;
}

const PopoverClose = forwardRef<HTMLButtonElement, PopoverCloseProps>(
  ({ children, className, onClick, ...props }, ref) => {
    const { setOpen } = usePopover();

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      setOpen(false);
      onClick?.(e);
    };

    return (
      <button
        ref={ref}
        type="button"
        className={cn(styles.close, className)}
        onClick={handleClick}
        {...props}
      >
        {children}
      </button>
    );
  },
);

PopoverClose.displayName = "Popover.Close";

/* ============================================
 * EXPORTS
 * ============================================ */

export const Popover = {
  Root: PopoverRoot,
  Trigger: PopoverTrigger,
  Content: PopoverContent,
  Close: PopoverClose,
};
