"use client";

import { Dialog as BaseDialog } from "@base-ui-components/react/dialog";
import React, { type ComponentPropsWithoutRef, forwardRef, type ReactNode } from "react";
import { cn } from "../utils/cn";
import styles from "./Dialog.module.css";

/* ============================================
 * ROOT
 * ============================================ */

export interface DialogRootProps {
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
   * Whether the dialog is modal (blocks interaction with the rest of the page)
   * @default true
   */
  modal?: boolean;
  children?: ReactNode;
}

function DialogRoot({ open, defaultOpen, onOpenChange, modal = true, children }: DialogRootProps) {
  return (
    <BaseDialog.Root
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={(open) => onOpenChange?.(open)}
      modal={modal}
    >
      {children}
    </BaseDialog.Root>
  );
}

DialogRoot.displayName = "Dialog.Root";

/* ============================================
 * TRIGGER
 * ============================================ */

export interface DialogTriggerProps extends ComponentPropsWithoutRef<"button"> {
  /**
   * Change the default rendered element for the one passed as a child
   */
  asChild?: boolean;
  children?: ReactNode;
}

const DialogTrigger = forwardRef<HTMLButtonElement, DialogTriggerProps>(
  ({ children, className, asChild, ...props }, ref) => {
    // When asChild is true, render the child element with Base UI behavior
    if (asChild && React.isValidElement(children)) {
      return (
        <BaseDialog.Trigger
          ref={ref}
          render={children as React.ReactElement<Record<string, unknown>>}
          className={cn(styles.trigger, className)}
          {...props}
        />
      );
    }

    return (
      <BaseDialog.Trigger ref={ref} className={cn(styles.trigger, className)} {...props}>
        {children}
      </BaseDialog.Trigger>
    );
  },
);

DialogTrigger.displayName = "Dialog.Trigger";

/* ============================================
 * PORTAL
 * ============================================ */

export interface DialogPortalProps {
  children?: ReactNode;
  /**
   * Container to render the portal into
   */
  container?: HTMLElement | null;
}

function DialogPortal({ children, container }: DialogPortalProps) {
  return <BaseDialog.Portal container={container}>{children}</BaseDialog.Portal>;
}

DialogPortal.displayName = "Dialog.Portal";

/* ============================================
 * OVERLAY
 * ============================================ */

export interface DialogOverlayProps extends ComponentPropsWithoutRef<"div"> {}

const DialogOverlay = forwardRef<HTMLDivElement, DialogOverlayProps>(
  ({ className, ...props }, ref) => {
    return <BaseDialog.Backdrop ref={ref} className={cn(styles.overlay, className)} {...props} />;
  },
);

DialogOverlay.displayName = "Dialog.Overlay";

/* ============================================
 * CONTENT
 * ============================================ */

export interface DialogContentProps extends ComponentPropsWithoutRef<"div"> {
  /**
   * Whether to close when clicking the overlay
   * @default true
   * @deprecated Use dismissible prop on Root instead
   */
  closeOnOverlayClick?: boolean;
  /**
   * Whether to close on Escape key
   * @default true
   * @deprecated Handled automatically by Base UI
   */
  closeOnEscape?: boolean;
  children?: ReactNode;
}

const DialogContent = forwardRef<HTMLDivElement, DialogContentProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <BaseDialog.Popup ref={ref} className={cn(styles.content, className)} {...props}>
        {children}
      </BaseDialog.Popup>
    );
  },
);

DialogContent.displayName = "Dialog.Content";

/* ============================================
 * HEADER
 * ============================================ */

export interface DialogHeaderProps extends ComponentPropsWithoutRef<"div"> {
  children?: ReactNode;
}

const DialogHeader = forwardRef<HTMLDivElement, DialogHeaderProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <div ref={ref} className={cn(styles.header, className)} {...props}>
        {children}
      </div>
    );
  },
);

DialogHeader.displayName = "Dialog.Header";

/* ============================================
 * TITLE
 * ============================================ */

export interface DialogTitleProps extends ComponentPropsWithoutRef<"h2"> {
  children?: ReactNode;
}

const DialogTitle = forwardRef<HTMLHeadingElement, DialogTitleProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <BaseDialog.Title ref={ref} className={cn(styles.title, className)} {...props}>
        {children}
      </BaseDialog.Title>
    );
  },
);

DialogTitle.displayName = "Dialog.Title";

/* ============================================
 * DESCRIPTION
 * ============================================ */

export interface DialogDescriptionProps extends ComponentPropsWithoutRef<"p"> {
  children?: ReactNode;
}

const DialogDescription = forwardRef<HTMLParagraphElement, DialogDescriptionProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <BaseDialog.Description ref={ref} className={cn(styles.description, className)} {...props}>
        {children}
      </BaseDialog.Description>
    );
  },
);

DialogDescription.displayName = "Dialog.Description";

/* ============================================
 * FOOTER
 * ============================================ */

export interface DialogFooterProps extends ComponentPropsWithoutRef<"div"> {
  children?: ReactNode;
}

const DialogFooter = forwardRef<HTMLDivElement, DialogFooterProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <div ref={ref} className={cn(styles.footer, className)} {...props}>
        {children}
      </div>
    );
  },
);

DialogFooter.displayName = "Dialog.Footer";

/* ============================================
 * CLOSE
 * ============================================ */

export interface DialogCloseProps extends ComponentPropsWithoutRef<"button"> {
  /**
   * Change the default rendered element for the one passed as a child
   */
  asChild?: boolean;
  children?: ReactNode;
}

const DialogClose = forwardRef<HTMLButtonElement, DialogCloseProps>(
  ({ children, className, asChild, ...props }, ref) => {
    // When asChild is true, render the child element with Base UI behavior
    if (asChild && React.isValidElement(children)) {
      return (
        <BaseDialog.Close
          ref={ref}
          render={children as React.ReactElement<Record<string, unknown>>}
          className={cn(styles.close, className)}
          {...props}
        />
      );
    }

    return (
      <BaseDialog.Close ref={ref} className={cn(styles.close, className)} {...props}>
        {children}
      </BaseDialog.Close>
    );
  },
);

DialogClose.displayName = "Dialog.Close";

/* ============================================
 * EXPORTS
 * ============================================ */

export const Dialog = {
  Root: DialogRoot,
  Trigger: DialogTrigger,
  Portal: DialogPortal,
  Overlay: DialogOverlay,
  Content: DialogContent,
  Header: DialogHeader,
  Title: DialogTitle,
  Description: DialogDescription,
  Footer: DialogFooter,
  Close: DialogClose,
};
