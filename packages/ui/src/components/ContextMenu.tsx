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
import styles from "./ContextMenu.module.css";
import { Portal } from "./Portal";

/* ============================================
 * CONTEXT
 * ============================================ */

interface ContextMenuContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  position: { x: number; y: number };
  setPosition: (position: { x: number; y: number }) => void;
  contentId: string;
}

const ContextMenuContext = createContext<ContextMenuContextValue | null>(null);

function useContextMenu() {
  const context = useContext(ContextMenuContext);
  if (!context) {
    throw new Error("ContextMenu components must be used within ContextMenu.Root");
  }
  return context;
}

/* ============================================
 * ROOT
 * ============================================ */

export interface ContextMenuRootProps {
  onOpenChange?: (open: boolean) => void;
  children?: ReactNode;
}

function ContextMenuRoot({ onOpenChange, children }: ContextMenuRootProps) {
  const [open, setInternalOpen] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const id = useId();
  const contentId = `context-menu-${id}`;

  const setOpen = useCallback(
    (newOpen: boolean) => {
      setInternalOpen(newOpen);
      onOpenChange?.(newOpen);
    },
    [onOpenChange],
  );

  return (
    <ContextMenuContext.Provider value={{ open, setOpen, position, setPosition, contentId }}>
      {children}
    </ContextMenuContext.Provider>
  );
}

ContextMenuRoot.displayName = "ContextMenu.Root";

/* ============================================
 * TRIGGER
 * ============================================ */

export interface ContextMenuTriggerProps extends ComponentPropsWithoutRef<"div"> {
  children?: ReactNode;
}

const ContextMenuTrigger = forwardRef<HTMLDivElement, ContextMenuTriggerProps>(
  ({ children, className, onContextMenu, ...props }, ref) => {
    const { setOpen, setPosition } = useContextMenu();

    const handleContextMenu = (e: React.MouseEvent<HTMLDivElement>) => {
      e.preventDefault();
      setPosition({ x: e.clientX, y: e.clientY });
      setOpen(true);
      onContextMenu?.(e);
    };

    return (
      <div
        ref={ref}
        className={cn(styles.trigger, className)}
        onContextMenu={handleContextMenu}
        {...props}
      >
        {children}
      </div>
    );
  },
);

ContextMenuTrigger.displayName = "ContextMenu.Trigger";

/* ============================================
 * CONTENT
 * ============================================ */

export interface ContextMenuContentProps extends ComponentPropsWithoutRef<"div"> {
  children?: ReactNode;
}

const ContextMenuContent = forwardRef<HTMLDivElement, ContextMenuContentProps>(
  ({ children, className, style, ...props }, ref) => {
    const { open, setOpen, position, contentId } = useContextMenu();
    const contentRef = useRef<HTMLDivElement>(null);
    const [adjustedPosition, setAdjustedPosition] = useState(position);

    // Adjust position to keep in viewport
    useEffect(() => {
      if (!open || !contentRef.current) return;

      const contentEl = contentRef.current;
      const rect = contentEl.getBoundingClientRect();
      const padding = 8;

      let x = position.x;
      let y = position.y;

      // Adjust if overflowing right
      if (x + rect.width > window.innerWidth - padding) {
        x = window.innerWidth - rect.width - padding;
      }

      // Adjust if overflowing bottom
      if (y + rect.height > window.innerHeight - padding) {
        y = window.innerHeight - rect.height - padding;
      }

      // Ensure not off-screen
      x = Math.max(padding, x);
      y = Math.max(padding, y);

      setAdjustedPosition({ x, y });
    }, [open, position]);

    // Close handlers
    useEffect(() => {
      if (!open) return;

      const handleClickOutside = (e: MouseEvent) => {
        const target = e.target as Node;
        if (contentRef.current && !contentRef.current.contains(target)) {
          setOpen(false);
        }
      };

      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          setOpen(false);
        }
      };

      const handleScroll = () => {
        setOpen(false);
      };

      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
      document.addEventListener("scroll", handleScroll, true);

      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
        document.removeEventListener("keydown", handleEscape);
        document.removeEventListener("scroll", handleScroll, true);
      };
    }, [open, setOpen]);

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
          role="menu"
          className={cn(styles.content, className)}
          style={{
            ...style,
            position: "fixed",
            top: adjustedPosition.y,
            left: adjustedPosition.x,
          }}
          {...props}
        >
          {children}
        </div>
      </Portal>
    );
  },
);

ContextMenuContent.displayName = "ContextMenu.Content";

/* ============================================
 * ITEM
 * ============================================ */

export interface ContextMenuItemProps extends ComponentPropsWithoutRef<"div"> {
  disabled?: boolean;
  destructive?: boolean;
  onSelect?: () => void;
  children?: ReactNode;
}

const ContextMenuItem = forwardRef<HTMLDivElement, ContextMenuItemProps>(
  (
    { disabled = false, destructive = false, onSelect, children, className, onClick, ...props },
    ref,
  ) => {
    const { setOpen } = useContextMenu();

    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
      if (!disabled) {
        onSelect?.();
        setOpen(false);
      }
      onClick?.(e);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (!disabled && (e.key === "Enter" || e.key === " ")) {
        e.preventDefault();
        onSelect?.();
        setOpen(false);
      }
    };

    return (
      <div
        ref={ref}
        role="menuitem"
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled}
        className={cn(styles.item, className)}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        {...dataAttrs({ disabled, destructive })}
        {...props}
      >
        {children}
      </div>
    );
  },
);

ContextMenuItem.displayName = "ContextMenu.Item";

/* ============================================
 * SEPARATOR
 * ============================================ */

export interface ContextMenuSeparatorProps extends ComponentPropsWithoutRef<"div"> {}

const ContextMenuSeparator = forwardRef<HTMLDivElement, ContextMenuSeparatorProps>(
  ({ className, ...props }, ref) => {
    return (
      <div ref={ref} role="separator" className={cn(styles.separator, className)} {...props} />
    );
  },
);

ContextMenuSeparator.displayName = "ContextMenu.Separator";

/* ============================================
 * LABEL
 * ============================================ */

export interface ContextMenuLabelProps extends ComponentPropsWithoutRef<"div"> {
  children?: ReactNode;
}

const ContextMenuLabel = forwardRef<HTMLDivElement, ContextMenuLabelProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <div ref={ref} className={cn(styles.label, className)} {...props}>
        {children}
      </div>
    );
  },
);

ContextMenuLabel.displayName = "ContextMenu.Label";

/* ============================================
 * EXPORTS
 * ============================================ */

export const ContextMenu = {
  Root: ContextMenuRoot,
  Trigger: ContextMenuTrigger,
  Content: ContextMenuContent,
  Item: ContextMenuItem,
  Separator: ContextMenuSeparator,
  Label: ContextMenuLabel,
};
