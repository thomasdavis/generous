"use client";

import {
  type KeyboardEvent,
  type ReactNode,
  type RefObject,
  useCallback,
  useEffect,
  useRef,
} from "react";

export interface FocusTrapProps {
  /**
   * Content to trap focus within
   */
  children: ReactNode;
  /**
   * Whether the focus trap is active
   * @default true
   */
  active?: boolean;
  /**
   * Whether to auto-focus the first focusable element when activated
   * @default true
   */
  autoFocus?: boolean;
  /**
   * Whether to restore focus to the previously focused element when deactivated
   * @default true
   */
  restoreFocus?: boolean;
  /**
   * Callback when the user attempts to escape the trap (e.g., pressing Escape)
   */
  onEscape?: () => void;
  /**
   * The element to focus initially (alternative to autoFocus)
   */
  initialFocusRef?: RefObject<HTMLElement | null>;
  /**
   * The element to return focus to when deactivated (alternative to restoreFocus)
   */
  returnFocusRef?: RefObject<HTMLElement | null>;
}

// Query for all focusable elements
const FOCUSABLE_SELECTOR = [
  "a[href]",
  "area[href]",
  "input:not([disabled]):not([type='hidden'])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "button:not([disabled])",
  "iframe",
  "object",
  "embed",
  "[tabindex]:not([tabindex='-1'])",
  "[contenteditable]",
  "audio[controls]",
  "video[controls]",
  "summary",
].join(",");

/**
 * FocusTrap keeps focus contained within a specific region of the DOM.
 * Essential for accessible modal dialogs and other overlay components.
 *
 * @example
 * <FocusTrap active={isOpen} onEscape={handleClose}>
 *   <div role="dialog">
 *     <button>First focusable</button>
 *     <button>Second focusable</button>
 *   </div>
 * </FocusTrap>
 */
export function FocusTrap({
  children,
  active = true,
  autoFocus = true,
  restoreFocus = true,
  onEscape,
  initialFocusRef,
  returnFocusRef,
}: FocusTrapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<Element | null>(null);

  // Get all focusable elements within the container
  const getFocusableElements = useCallback(() => {
    if (!containerRef.current) return [];
    return Array.from(
      containerRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
    ).filter((el) => {
      // Filter out elements that are not visible
      return el.offsetParent !== null && !el.hasAttribute("inert");
    });
  }, []);

  // Focus the first element or initial focus ref
  const focusFirst = useCallback(() => {
    if (initialFocusRef?.current) {
      initialFocusRef.current.focus();
      return;
    }

    const focusable = getFocusableElements();
    const firstElement = focusable[0];
    if (firstElement) {
      firstElement.focus();
    } else if (containerRef.current) {
      // If no focusable elements, focus the container itself
      containerRef.current.focus();
    }
  }, [getFocusableElements, initialFocusRef]);

  // Handle activation
  useEffect(() => {
    if (!active) return;

    // Store the currently focused element
    previousFocusRef.current = document.activeElement;

    // Auto-focus first element
    if (autoFocus) {
      // Use requestAnimationFrame to ensure the DOM is ready
      requestAnimationFrame(() => {
        focusFirst();
      });
    }

    // Cleanup: restore focus when deactivated
    return () => {
      if (restoreFocus) {
        const returnTo = returnFocusRef?.current ?? previousFocusRef.current;
        if (returnTo && returnTo instanceof HTMLElement) {
          returnTo.focus();
        }
      }
    };
  }, [active, autoFocus, restoreFocus, focusFirst, returnFocusRef]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (!active) return;

      // Handle Escape key
      if (event.key === "Escape" && onEscape) {
        event.preventDefault();
        onEscape();
        return;
      }

      // Handle Tab key for focus trapping
      if (event.key === "Tab") {
        const focusable = getFocusableElements();
        const firstEl = focusable[0];
        const lastEl = focusable[focusable.length - 1];

        if (!firstEl || !lastEl) {
          event.preventDefault();
          return;
        }

        const activeElement = document.activeElement;

        // Shift + Tab from first element -> go to last
        if (event.shiftKey && activeElement === firstEl) {
          event.preventDefault();
          lastEl.focus();
          return;
        }

        // Tab from last element -> go to first
        if (!event.shiftKey && activeElement === lastEl) {
          event.preventDefault();
          firstEl.focus();
          return;
        }
      }
    },
    [active, onEscape, getFocusableElements],
  );

  return (
    <div ref={containerRef} onKeyDown={handleKeyDown} tabIndex={-1} style={{ outline: "none" }}>
      {children}
    </div>
  );
}

FocusTrap.displayName = "FocusTrap";
