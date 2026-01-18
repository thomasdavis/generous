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
  useState,
} from "react";
import { cn } from "../utils/cn";
import styles from "./Dialog.module.css";
import { FocusTrap } from "./FocusTrap";
import { Portal } from "./Portal";

/* ============================================
 * CONTEXT
 * ============================================ */

interface DialogContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  titleId: string;
  descriptionId: string;
}

const DialogContext = createContext<DialogContextValue | null>(null);

function useDialog() {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error("Dialog components must be used within Dialog.Root");
  }
  return context;
}

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
  children?: ReactNode;
}

function DialogRoot({
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  children,
}: DialogRootProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;

  const id = useId();
  const titleId = `dialog-title-${id}`;
  const descriptionId = `dialog-description-${id}`;

  const setOpen = useCallback(
    (newOpen: boolean) => {
      if (!isControlled) {
        setInternalOpen(newOpen);
      }
      onOpenChange?.(newOpen);
    },
    [isControlled, onOpenChange],
  );

  // Prevent body scroll when open
  useEffect(() => {
    if (open) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [open]);

  return (
    <DialogContext.Provider value={{ open, setOpen, titleId, descriptionId }}>
      {children}
    </DialogContext.Provider>
  );
}

DialogRoot.displayName = "Dialog.Root";

/* ============================================
 * TRIGGER
 * ============================================ */

export interface DialogTriggerProps extends ComponentPropsWithoutRef<"button"> {
  children?: ReactNode;
}

const DialogTrigger = forwardRef<HTMLButtonElement, DialogTriggerProps>(
  ({ children, className, onClick, ...props }, ref) => {
    const { setOpen } = useDialog();

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      setOpen(true);
      onClick?.(e);
    };

    return (
      <button
        ref={ref}
        type="button"
        className={cn(styles.trigger, className)}
        onClick={handleClick}
        {...props}
      >
        {children}
      </button>
    );
  },
);

DialogTrigger.displayName = "Dialog.Trigger";

/* ============================================
 * OVERLAY
 * ============================================ */

export interface DialogOverlayProps extends ComponentPropsWithoutRef<"div"> {}

const DialogOverlay = forwardRef<HTMLDivElement, DialogOverlayProps>(
  ({ className, onClick, ...props }, ref) => {
    const { open, setOpen } = useDialog();

    if (!open) return null;

    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) {
        setOpen(false);
      }
      onClick?.(e);
    };

    return (
      <Portal>
        <div
          ref={ref}
          className={cn(styles.overlay, className)}
          onClick={handleClick}
          aria-hidden="true"
          {...props}
        />
      </Portal>
    );
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
   */
  closeOnOverlayClick?: boolean;
  /**
   * Whether to close on Escape key
   * @default true
   */
  closeOnEscape?: boolean;
  children?: ReactNode;
}

const DialogContent = forwardRef<HTMLDivElement, DialogContentProps>(
  ({ closeOnOverlayClick = true, closeOnEscape = true, children, className, ...props }, ref) => {
    const { open, setOpen, titleId, descriptionId } = useDialog();

    const handleEscape = useCallback(() => {
      if (closeOnEscape) {
        setOpen(false);
      }
    }, [closeOnEscape, setOpen]);

    if (!open) return null;

    return (
      <Portal>
        <div className={styles.contentWrapper}>
          <div
            className={styles.overlay}
            onClick={closeOnOverlayClick ? () => setOpen(false) : undefined}
            aria-hidden="true"
          />
          <FocusTrap active={open} onEscape={handleEscape}>
            <div
              ref={ref}
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              aria-describedby={descriptionId}
              className={cn(styles.content, className)}
              {...props}
            >
              {children}
            </div>
          </FocusTrap>
        </div>
      </Portal>
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
    const { titleId } = useDialog();

    return (
      <h2 ref={ref} id={titleId} className={cn(styles.title, className)} {...props}>
        {children}
      </h2>
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
    const { descriptionId } = useDialog();

    return (
      <p ref={ref} id={descriptionId} className={cn(styles.description, className)} {...props}>
        {children}
      </p>
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
  children?: ReactNode;
}

const DialogClose = forwardRef<HTMLButtonElement, DialogCloseProps>(
  ({ children, className, onClick, ...props }, ref) => {
    const { setOpen } = useDialog();

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

DialogClose.displayName = "Dialog.Close";

/* ============================================
 * EXPORTS
 * ============================================ */

export const Dialog = {
  Root: DialogRoot,
  Trigger: DialogTrigger,
  Overlay: DialogOverlay,
  Content: DialogContent,
  Header: DialogHeader,
  Title: DialogTitle,
  Description: DialogDescription,
  Footer: DialogFooter,
  Close: DialogClose,
};
