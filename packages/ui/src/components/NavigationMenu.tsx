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
import styles from "./NavigationMenu.module.css";

/* ============================================
 * CONTEXT
 * ============================================ */

interface NavigationMenuContextValue {
  value: string;
  setValue: (value: string) => void;
  baseId: string;
}

const NavigationMenuContext = createContext<NavigationMenuContextValue | null>(null);

function _useNavigationMenu() {
  const context = useContext(NavigationMenuContext);
  if (!context) {
    throw new Error("NavigationMenu components must be used within NavigationMenu.Root");
  }
  return context;
}

/* ============================================
 * ROOT
 * ============================================ */

export interface NavigationMenuRootProps extends ComponentPropsWithoutRef<"nav"> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  children?: ReactNode;
}

const NavigationMenuRoot = forwardRef<HTMLElement, NavigationMenuRootProps>(
  (
    { value: controlledValue, defaultValue = "", onValueChange, children, className, ...props },
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
      <NavigationMenuContext.Provider value={{ value, setValue, baseId }}>
        <nav ref={ref} className={cn(styles.root, className)} {...props}>
          {children}
        </nav>
      </NavigationMenuContext.Provider>
    );
  },
);

NavigationMenuRoot.displayName = "NavigationMenu.Root";

/* ============================================
 * LIST
 * ============================================ */

export interface NavigationMenuListProps extends ComponentPropsWithoutRef<"ul"> {
  children?: ReactNode;
}

const NavigationMenuList = forwardRef<HTMLUListElement, NavigationMenuListProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <ul ref={ref} className={cn(styles.list, className)} {...props}>
        {children}
      </ul>
    );
  },
);

NavigationMenuList.displayName = "NavigationMenu.List";

/* ============================================
 * ITEM
 * ============================================ */

export interface NavigationMenuItemProps extends ComponentPropsWithoutRef<"li"> {
  value?: string;
  children?: ReactNode;
}

const NavigationMenuItem = forwardRef<HTMLLIElement, NavigationMenuItemProps>(
  ({ value, children, className, ...props }, ref) => {
    return (
      <li ref={ref} className={cn(styles.item, className)} {...props}>
        {children}
      </li>
    );
  },
);

NavigationMenuItem.displayName = "NavigationMenu.Item";

/* ============================================
 * TRIGGER
 * ============================================ */

export interface NavigationMenuTriggerProps extends ComponentPropsWithoutRef<"button"> {
  children?: ReactNode;
}

const NavigationMenuTrigger = forwardRef<HTMLButtonElement, NavigationMenuTriggerProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <button ref={ref} type="button" className={cn(styles.trigger, className)} {...props}>
        {children}
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
    );
  },
);

NavigationMenuTrigger.displayName = "NavigationMenu.Trigger";

/* ============================================
 * CONTENT
 * ============================================ */

export interface NavigationMenuContentProps extends ComponentPropsWithoutRef<"div"> {
  children?: ReactNode;
}

const NavigationMenuContent = forwardRef<HTMLDivElement, NavigationMenuContentProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <div ref={ref} className={cn(styles.content, className)} {...props}>
        {children}
      </div>
    );
  },
);

NavigationMenuContent.displayName = "NavigationMenu.Content";

/* ============================================
 * LINK
 * ============================================ */

export interface NavigationMenuLinkProps extends ComponentPropsWithoutRef<"a"> {
  active?: boolean;
  children?: ReactNode;
}

const NavigationMenuLink = forwardRef<HTMLAnchorElement, NavigationMenuLinkProps>(
  ({ active = false, children, className, ...props }, ref) => {
    return (
      <a
        ref={ref}
        className={cn(styles.link, className)}
        aria-current={active ? "page" : undefined}
        {...dataAttrs({ active })}
        {...props}
      >
        {children}
      </a>
    );
  },
);

NavigationMenuLink.displayName = "NavigationMenu.Link";

/* ============================================
 * EXPORTS
 * ============================================ */

export const NavigationMenu = {
  Root: NavigationMenuRoot,
  List: NavigationMenuList,
  Item: NavigationMenuItem,
  Trigger: NavigationMenuTrigger,
  Content: NavigationMenuContent,
  Link: NavigationMenuLink,
};
