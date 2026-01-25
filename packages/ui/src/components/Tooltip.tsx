"use client";

import { Tooltip as BaseTooltip } from "@base-ui-components/react/tooltip";
import React, { type ComponentPropsWithoutRef, forwardRef, type ReactNode } from "react";
import { cn } from "../utils/cn";
import styles from "./Tooltip.module.css";

/* ============================================
 * PROVIDER
 * ============================================ */

export interface TooltipProviderProps {
  /**
   * Delay before showing tooltip (ms)
   * @default 400
   */
  delay?: number;
  /**
   * Delay before closing tooltip (ms)
   * @default 0
   */
  closeDelay?: number;
  children?: ReactNode;
}

function TooltipProvider({ delay = 400, closeDelay = 0, children }: TooltipProviderProps) {
  return (
    <BaseTooltip.Provider delay={delay} closeDelay={closeDelay}>
      {children}
    </BaseTooltip.Provider>
  );
}

TooltipProvider.displayName = "Tooltip.Provider";

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
   * Delay before showing tooltip (ms).
   * Creates an internal Provider if specified.
   * @default 400
   */
  delay?: number;
  /**
   * Delay before closing tooltip (ms).
   * Creates an internal Provider if specified.
   * @default 0
   */
  closeDelay?: number;
  /**
   * @deprecated Use delay instead
   */
  delayDuration?: number;
  children?: ReactNode;
}

function TooltipRoot({
  open,
  defaultOpen,
  onOpenChange,
  delay,
  closeDelay,
  delayDuration,
  children,
}: TooltipRootProps) {
  // Support legacy delayDuration prop
  const effectiveDelay = delay ?? delayDuration;

  const root = (
    <BaseTooltip.Root
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={(open) => onOpenChange?.(open)}
    >
      {children}
    </BaseTooltip.Root>
  );

  // If delay is specified, wrap in a provider
  if (effectiveDelay !== undefined || closeDelay !== undefined) {
    return (
      <BaseTooltip.Provider delay={effectiveDelay} closeDelay={closeDelay}>
        {root}
      </BaseTooltip.Provider>
    );
  }

  return root;
}

TooltipRoot.displayName = "Tooltip.Root";

/* ============================================
 * TRIGGER
 * ============================================ */

export interface TooltipTriggerProps extends ComponentPropsWithoutRef<"button"> {
  /**
   * Change the default rendered element for the one passed as a child
   */
  asChild?: boolean;
  children?: ReactNode;
}

const TooltipTrigger = forwardRef<HTMLButtonElement, TooltipTriggerProps>(
  ({ children, className, asChild, ...props }, ref) => {
    if (asChild && React.isValidElement(children)) {
      return (
        <BaseTooltip.Trigger
          ref={ref}
          render={children as React.ReactElement<Record<string, unknown>>}
          className={cn(styles.trigger, className)}
          {...props}
        />
      );
    }

    return (
      <BaseTooltip.Trigger ref={ref} className={cn(styles.trigger, className)} {...props}>
        {children}
      </BaseTooltip.Trigger>
    );
  },
);

TooltipTrigger.displayName = "Tooltip.Trigger";

/* ============================================
 * PORTAL
 * ============================================ */

export interface TooltipPortalProps {
  children?: ReactNode;
  container?: HTMLElement | null;
}

function TooltipPortal({ children, container }: TooltipPortalProps) {
  return <BaseTooltip.Portal container={container}>{children}</BaseTooltip.Portal>;
}

TooltipPortal.displayName = "Tooltip.Portal";

/* ============================================
 * POSITIONER
 * ============================================ */

export interface TooltipPositionerProps extends ComponentPropsWithoutRef<"div"> {
  /**
   * Preferred side
   * @default "top"
   */
  side?: "top" | "right" | "bottom" | "left";
  /**
   * Preferred alignment
   * @default "center"
   */
  align?: "start" | "center" | "end";
  /**
   * Distance from trigger
   * @default 6
   */
  sideOffset?: number;
  children?: ReactNode;
}

const TooltipPositioner = forwardRef<HTMLDivElement, TooltipPositionerProps>(
  ({ side = "top", align = "center", sideOffset = 6, children, className, ...props }, ref) => {
    return (
      <BaseTooltip.Positioner
        ref={ref}
        side={side}
        align={align}
        sideOffset={sideOffset}
        className={cn(styles.positioner, className)}
        {...props}
      >
        {children}
      </BaseTooltip.Positioner>
    );
  },
);

TooltipPositioner.displayName = "Tooltip.Positioner";

/* ============================================
 * CONTENT
 * ============================================ */

export interface TooltipContentProps extends ComponentPropsWithoutRef<"div"> {
  /**
   * Preferred side
   * @default "top"
   * @deprecated Use TooltipPositioner side prop instead
   */
  side?: "top" | "right" | "bottom" | "left";
  /**
   * Distance from trigger
   * @default 6
   * @deprecated Use TooltipPositioner sideOffset prop instead
   */
  sideOffset?: number;
  children?: ReactNode;
}

const TooltipContent = forwardRef<HTMLDivElement, TooltipContentProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <BaseTooltip.Popup ref={ref} className={cn(styles.content, className)} {...props}>
        {children}
      </BaseTooltip.Popup>
    );
  },
);

TooltipContent.displayName = "Tooltip.Content";

/* ============================================
 * ARROW
 * ============================================ */

export interface TooltipArrowProps extends ComponentPropsWithoutRef<"div"> {
  children?: ReactNode;
}

const TooltipArrow = forwardRef<HTMLDivElement, TooltipArrowProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <BaseTooltip.Arrow ref={ref} className={cn(styles.arrow, className)} {...props}>
        {children}
      </BaseTooltip.Arrow>
    );
  },
);

TooltipArrow.displayName = "Tooltip.Arrow";

/* ============================================
 * EXPORTS
 * ============================================ */

export const Tooltip = {
  Provider: TooltipProvider,
  Root: TooltipRoot,
  Trigger: TooltipTrigger,
  Portal: TooltipPortal,
  Positioner: TooltipPositioner,
  Content: TooltipContent,
  Arrow: TooltipArrow,
};
