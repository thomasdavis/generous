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
import styles from "./Menu.module.css";
import { Portal } from "./Portal";

/* ============================================
 * CONTEXT
 * ============================================ */

interface MenuContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  triggerId: string;
  contentId: string;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
}

const MenuContext = createContext<MenuContextValue | null>(null);

function useMenu() {
  const context = useContext(MenuContext);
  if (!context) {
    throw new Error("Menu components must be used within Menu.Root");
  }
  return context;
}

/* ============================================
 * ROOT
 * ============================================ */

export interface MenuRootProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: ReactNode;
}

function MenuRoot({
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  children,
}: MenuRootProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  const id = useId();
  const triggerId = `menu-trigger-${id}`;
  const contentId = `menu-content-${id}`;

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
    <MenuContext.Provider value={{ open, setOpen, triggerId, contentId, triggerRef }}>
      {children}
    </MenuContext.Provider>
  );
}

MenuRoot.displayName = "Menu.Root";

/* ============================================
 * TRIGGER
 * ============================================ */

export interface MenuTriggerProps extends ComponentPropsWithoutRef<"button"> {
  children?: ReactNode;
}

const MenuTrigger = forwardRef<HTMLButtonElement, MenuTriggerProps>(
  ({ children, className, onClick, ...props }, ref) => {
    const { open, setOpen, triggerId, contentId, triggerRef } = useMenu();

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      setOpen(!open);
      onClick?.(e);
    };

    return (
      <button
        ref={(node) => {
          triggerRef.current = node;
          if (typeof ref === "function") ref(node);
          else if (ref) ref.current = node;
        }}
        type="button"
        id={triggerId}
        aria-haspopup="menu"
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

MenuTrigger.displayName = "Menu.Trigger";

/* ============================================
 * CONTENT
 * ============================================ */

export interface MenuContentProps extends ComponentPropsWithoutRef<"div"> {
  align?: "start" | "center" | "end";
  side?: "top" | "right" | "bottom" | "left";
  sideOffset?: number;
  children?: ReactNode;
}

const MenuContent = forwardRef<HTMLDivElement, MenuContentProps>(
  (
    { align = "start", side = "bottom", sideOffset = 4, children, className, style, ...props },
    ref,
  ) => {
    const { open, setOpen, contentId, triggerRef } = useMenu();
    const contentRef = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState({ top: 0, left: 0 });

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
        }

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
          role="menu"
          className={cn(styles.content, className)}
          {...dataAttrs({ side })}
          style={{ ...style, position: "fixed", top: position.top, left: position.left }}
          {...props}
        >
          {children}
        </div>
      </Portal>
    );
  },
);

MenuContent.displayName = "Menu.Content";

/* ============================================
 * ITEM
 * ============================================ */

export interface MenuItemProps extends ComponentPropsWithoutRef<"div"> {
  disabled?: boolean;
  destructive?: boolean;
  onSelect?: () => void;
  children?: ReactNode;
}

const MenuItem = forwardRef<HTMLDivElement, MenuItemProps>(
  (
    { disabled = false, destructive = false, onSelect, children, className, onClick, ...props },
    ref,
  ) => {
    const { setOpen } = useMenu();

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

MenuItem.displayName = "Menu.Item";

/* ============================================
 * SEPARATOR
 * ============================================ */

export interface MenuSeparatorProps extends ComponentPropsWithoutRef<"div"> {}

const MenuSeparator = forwardRef<HTMLDivElement, MenuSeparatorProps>(
  ({ className, ...props }, ref) => {
    return (
      <div ref={ref} role="separator" className={cn(styles.separator, className)} {...props} />
    );
  },
);

MenuSeparator.displayName = "Menu.Separator";

/* ============================================
 * LABEL
 * ============================================ */

export interface MenuLabelProps extends ComponentPropsWithoutRef<"div"> {
  children?: ReactNode;
}

const MenuLabel = forwardRef<HTMLDivElement, MenuLabelProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <div ref={ref} className={cn(styles.label, className)} {...props}>
        {children}
      </div>
    );
  },
);

MenuLabel.displayName = "Menu.Label";

/* ============================================
 * EXPORTS
 * ============================================ */

export const Menu = {
  Root: MenuRoot,
  Trigger: MenuTrigger,
  Content: MenuContent,
  Item: MenuItem,
  Separator: MenuSeparator,
  Label: MenuLabel,
};
