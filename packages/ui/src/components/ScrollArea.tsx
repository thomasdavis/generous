"use client";

import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { forwardRef } from "react";
import { cn, dataAttrs } from "../utils/cn";
import styles from "./ScrollArea.module.css";

/* ============================================
 * ROOT
 * ============================================ */

export interface ScrollAreaRootProps extends ComponentPropsWithoutRef<"div"> {
  /**
   * Scrollbar visibility
   * @default "auto"
   */
  scrollbars?: "auto" | "always" | "hover";
  /**
   * Scroll direction
   * @default "vertical"
   */
  orientation?: "vertical" | "horizontal" | "both";
  children?: ReactNode;
}

const ScrollAreaRoot = forwardRef<HTMLDivElement, ScrollAreaRootProps>(
  ({ scrollbars = "auto", orientation = "vertical", children, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(styles.root, className)}
        {...dataAttrs({ scrollbars, orientation })}
        {...props}
      >
        {children}
      </div>
    );
  },
);

ScrollAreaRoot.displayName = "ScrollArea.Root";

/* ============================================
 * VIEWPORT
 * ============================================ */

export interface ScrollAreaViewportProps extends ComponentPropsWithoutRef<"div"> {
  children?: ReactNode;
}

const ScrollAreaViewport = forwardRef<HTMLDivElement, ScrollAreaViewportProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <div ref={ref} className={cn(styles.viewport, className)} {...props}>
        {children}
      </div>
    );
  },
);

ScrollAreaViewport.displayName = "ScrollArea.Viewport";

/* ============================================
 * EXPORTS
 * ============================================ */

export const ScrollArea = {
  Root: ScrollAreaRoot,
  Viewport: ScrollAreaViewport,
};
