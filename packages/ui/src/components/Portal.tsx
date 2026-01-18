"use client";

import { type ReactNode, useEffect, useState } from "react";
import { createPortal } from "react-dom";

export interface PortalProps {
  /**
   * Content to render in the portal
   */
  children: ReactNode;
  /**
   * The container element to render into
   * @default document.body
   */
  container?: Element | null;
  /**
   * Key for the portal (useful for animations)
   */
  key?: string | null;
}

/**
 * Portal renders children into a DOM node that exists outside the parent component's hierarchy.
 * Useful for modals, tooltips, dropdowns, and other overlay content.
 *
 * @example
 * <Portal>
 *   <div className="modal">Modal content</div>
 * </Portal>
 *
 * @example
 * // Render into a specific container
 * <Portal container={document.getElementById('modal-root')}>
 *   <div className="modal">Modal content</div>
 * </Portal>
 */
export function Portal({ children, container, key }: PortalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render on server
  if (!mounted) {
    return null;
  }

  // Use provided container or default to document.body
  const target = container ?? document.body;

  return createPortal(children, target, key);
}

Portal.displayName = "Portal";
