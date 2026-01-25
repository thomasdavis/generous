"use client";

import { Popover as BasePopover } from "@base-ui-components/react/popover";
import React, { type ComponentPropsWithoutRef, forwardRef, type ReactNode } from "react";
import { cn } from "../utils/cn";
import styles from "./Popover.module.css";

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

function PopoverRoot({ open, defaultOpen, onOpenChange, children }: PopoverRootProps) {
  return (
    <BasePopover.Root
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={(open) => onOpenChange?.(open)}
    >
      {children}
    </BasePopover.Root>
  );
}

PopoverRoot.displayName = "Popover.Root";

/* ============================================
 * TRIGGER
 * ============================================ */

export interface PopoverTriggerProps extends ComponentPropsWithoutRef<"button"> {
  /**
   * Change the default rendered element for the one passed as a child
   */
  asChild?: boolean;
  children?: ReactNode;
}

const PopoverTrigger = forwardRef<HTMLButtonElement, PopoverTriggerProps>(
  ({ children, className, asChild, ...props }, ref) => {
    if (asChild && React.isValidElement(children)) {
      return (
        <BasePopover.Trigger
          ref={ref}
          render={children as React.ReactElement<Record<string, unknown>>}
          className={cn(styles.trigger, className)}
          {...props}
        />
      );
    }

    return (
      <BasePopover.Trigger ref={ref} className={cn(styles.trigger, className)} {...props}>
        {children}
      </BasePopover.Trigger>
    );
  },
);

PopoverTrigger.displayName = "Popover.Trigger";

/* ============================================
 * PORTAL
 * ============================================ */

export interface PopoverPortalProps {
  children?: ReactNode;
  container?: HTMLElement | null;
}

function PopoverPortal({ children, container }: PopoverPortalProps) {
  return <BasePopover.Portal container={container}>{children}</BasePopover.Portal>;
}

PopoverPortal.displayName = "Popover.Portal";

/* ============================================
 * POSITIONER
 * ============================================ */

export interface PopoverPositionerProps extends ComponentPropsWithoutRef<"div"> {
  /**
   * Preferred side
   * @default "bottom"
   */
  side?: "top" | "right" | "bottom" | "left";
  /**
   * Preferred alignment
   * @default "center"
   */
  align?: "start" | "center" | "end";
  /**
   * Distance from trigger
   * @default 8
   */
  sideOffset?: number;
  /**
   * Alignment offset
   * @default 0
   */
  alignOffset?: number;
  children?: ReactNode;
}

const PopoverPositioner = forwardRef<HTMLDivElement, PopoverPositionerProps>(
  (
    {
      side = "bottom",
      align = "center",
      sideOffset = 8,
      alignOffset = 0,
      children,
      className,
      ...props
    },
    ref,
  ) => {
    return (
      <BasePopover.Positioner
        ref={ref}
        side={side}
        align={align}
        sideOffset={sideOffset}
        alignOffset={alignOffset}
        className={cn(styles.positioner, className)}
        {...props}
      >
        {children}
      </BasePopover.Positioner>
    );
  },
);

PopoverPositioner.displayName = "Popover.Positioner";

/* ============================================
 * CONTENT
 * ============================================ */

export interface PopoverContentProps extends ComponentPropsWithoutRef<"div"> {
  /**
   * Preferred alignment
   * @default "center"
   * @deprecated Use PopoverPositioner align prop instead
   */
  align?: "start" | "center" | "end";
  /**
   * Preferred side
   * @default "bottom"
   * @deprecated Use PopoverPositioner side prop instead
   */
  side?: "top" | "right" | "bottom" | "left";
  /**
   * Distance from trigger
   * @default 8
   * @deprecated Use PopoverPositioner sideOffset prop instead
   */
  sideOffset?: number;
  children?: ReactNode;
}

const PopoverContent = forwardRef<HTMLDivElement, PopoverContentProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <BasePopover.Popup ref={ref} className={cn(styles.content, className)} {...props}>
        {children}
      </BasePopover.Popup>
    );
  },
);

PopoverContent.displayName = "Popover.Content";

/* ============================================
 * ARROW
 * ============================================ */

export interface PopoverArrowProps extends ComponentPropsWithoutRef<"div"> {
  children?: ReactNode;
}

const PopoverArrow = forwardRef<HTMLDivElement, PopoverArrowProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <BasePopover.Arrow ref={ref} className={cn(styles.arrow, className)} {...props}>
        {children}
      </BasePopover.Arrow>
    );
  },
);

PopoverArrow.displayName = "Popover.Arrow";

/* ============================================
 * CLOSE
 * ============================================ */

export interface PopoverCloseProps extends ComponentPropsWithoutRef<"button"> {
  /**
   * Change the default rendered element for the one passed as a child
   */
  asChild?: boolean;
  children?: ReactNode;
}

const PopoverClose = forwardRef<HTMLButtonElement, PopoverCloseProps>(
  ({ children, className, asChild, ...props }, ref) => {
    if (asChild && React.isValidElement(children)) {
      return (
        <BasePopover.Close
          ref={ref}
          render={children as React.ReactElement<Record<string, unknown>>}
          className={cn(styles.close, className)}
          {...props}
        />
      );
    }

    return (
      <BasePopover.Close ref={ref} className={cn(styles.close, className)} {...props}>
        {children}
      </BasePopover.Close>
    );
  },
);

PopoverClose.displayName = "Popover.Close";

/* ============================================
 * TITLE
 * ============================================ */

export interface PopoverTitleProps extends ComponentPropsWithoutRef<"h3"> {
  children?: ReactNode;
}

const PopoverTitle = forwardRef<HTMLHeadingElement, PopoverTitleProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <BasePopover.Title ref={ref} className={cn(styles.title, className)} {...props}>
        {children}
      </BasePopover.Title>
    );
  },
);

PopoverTitle.displayName = "Popover.Title";

/* ============================================
 * DESCRIPTION
 * ============================================ */

export interface PopoverDescriptionProps extends ComponentPropsWithoutRef<"p"> {
  children?: ReactNode;
}

const PopoverDescription = forwardRef<HTMLParagraphElement, PopoverDescriptionProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <BasePopover.Description ref={ref} className={cn(styles.description, className)} {...props}>
        {children}
      </BasePopover.Description>
    );
  },
);

PopoverDescription.displayName = "Popover.Description";

/* ============================================
 * EXPORTS
 * ============================================ */

export const Popover = {
  Root: PopoverRoot,
  Trigger: PopoverTrigger,
  Portal: PopoverPortal,
  Positioner: PopoverPositioner,
  Content: PopoverContent,
  Arrow: PopoverArrow,
  Close: PopoverClose,
  Title: PopoverTitle,
  Description: PopoverDescription,
};
