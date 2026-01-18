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
import styles from "./AlertDialog.module.css";
import { FocusTrap } from "./FocusTrap";
import { Portal } from "./Portal";

/* ============================================
 * CONTEXT
 * ============================================ */

interface AlertDialogContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  titleId: string;
  descriptionId: string;
}

const AlertDialogContext = createContext<AlertDialogContextValue | null>(null);

function useAlertDialog() {
  const context = useContext(AlertDialogContext);
  if (!context) {
    throw new Error("AlertDialog components must be used within AlertDialog.Root");
  }
  return context;
}

/* ============================================
 * ROOT
 * ============================================ */

export interface AlertDialogRootProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: ReactNode;
}

function AlertDialogRoot({
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  children,
}: AlertDialogRootProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;

  const id = useId();
  const titleId = `alert-dialog-title-${id}`;
  const descriptionId = `alert-dialog-description-${id}`;

  const setOpen = useCallback(
    (newOpen: boolean) => {
      if (!isControlled) {
        setInternalOpen(newOpen);
      }
      onOpenChange?.(newOpen);
    },
    [isControlled, onOpenChange],
  );

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
    <AlertDialogContext.Provider value={{ open, setOpen, titleId, descriptionId }}>
      {children}
    </AlertDialogContext.Provider>
  );
}

AlertDialogRoot.displayName = "AlertDialog.Root";

/* ============================================
 * TRIGGER
 * ============================================ */

export interface AlertDialogTriggerProps extends ComponentPropsWithoutRef<"button"> {
  children?: ReactNode;
}

const AlertDialogTrigger = forwardRef<HTMLButtonElement, AlertDialogTriggerProps>(
  ({ children, className, onClick, ...props }, ref) => {
    const { setOpen } = useAlertDialog();

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      setOpen(true);
      onClick?.(e);
    };

    return (
      <button ref={ref} type="button" className={className} onClick={handleClick} {...props}>
        {children}
      </button>
    );
  },
);

AlertDialogTrigger.displayName = "AlertDialog.Trigger";

/* ============================================
 * CONTENT
 * ============================================ */

export interface AlertDialogContentProps extends ComponentPropsWithoutRef<"div"> {
  children?: ReactNode;
}

const AlertDialogContent = forwardRef<HTMLDivElement, AlertDialogContentProps>(
  ({ children, className, ...props }, ref) => {
    const { open, titleId, descriptionId } = useAlertDialog();

    if (!open) return null;

    return (
      <Portal>
        <div className={styles.contentWrapper}>
          <div className={styles.overlay} aria-hidden="true" />
          <FocusTrap active={open}>
            <div
              ref={ref}
              role="alertdialog"
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

AlertDialogContent.displayName = "AlertDialog.Content";

/* ============================================
 * HEADER
 * ============================================ */

export interface AlertDialogHeaderProps extends ComponentPropsWithoutRef<"div"> {
  children?: ReactNode;
}

const AlertDialogHeader = forwardRef<HTMLDivElement, AlertDialogHeaderProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <div ref={ref} className={cn(styles.header, className)} {...props}>
        {children}
      </div>
    );
  },
);

AlertDialogHeader.displayName = "AlertDialog.Header";

/* ============================================
 * TITLE
 * ============================================ */

export interface AlertDialogTitleProps extends ComponentPropsWithoutRef<"h2"> {
  children?: ReactNode;
}

const AlertDialogTitle = forwardRef<HTMLHeadingElement, AlertDialogTitleProps>(
  ({ children, className, ...props }, ref) => {
    const { titleId } = useAlertDialog();

    return (
      <h2 ref={ref} id={titleId} className={cn(styles.title, className)} {...props}>
        {children}
      </h2>
    );
  },
);

AlertDialogTitle.displayName = "AlertDialog.Title";

/* ============================================
 * DESCRIPTION
 * ============================================ */

export interface AlertDialogDescriptionProps extends ComponentPropsWithoutRef<"p"> {
  children?: ReactNode;
}

const AlertDialogDescription = forwardRef<HTMLParagraphElement, AlertDialogDescriptionProps>(
  ({ children, className, ...props }, ref) => {
    const { descriptionId } = useAlertDialog();

    return (
      <p ref={ref} id={descriptionId} className={cn(styles.description, className)} {...props}>
        {children}
      </p>
    );
  },
);

AlertDialogDescription.displayName = "AlertDialog.Description";

/* ============================================
 * FOOTER
 * ============================================ */

export interface AlertDialogFooterProps extends ComponentPropsWithoutRef<"div"> {
  children?: ReactNode;
}

const AlertDialogFooter = forwardRef<HTMLDivElement, AlertDialogFooterProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <div ref={ref} className={cn(styles.footer, className)} {...props}>
        {children}
      </div>
    );
  },
);

AlertDialogFooter.displayName = "AlertDialog.Footer";

/* ============================================
 * ACTION
 * ============================================ */

export interface AlertDialogActionProps extends ComponentPropsWithoutRef<"button"> {
  children?: ReactNode;
}

const AlertDialogAction = forwardRef<HTMLButtonElement, AlertDialogActionProps>(
  ({ children, className, onClick, ...props }, ref) => {
    const { setOpen } = useAlertDialog();

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(e);
      setOpen(false);
    };

    return (
      <button
        ref={ref}
        type="button"
        className={cn(styles.action, className)}
        onClick={handleClick}
        {...props}
      >
        {children}
      </button>
    );
  },
);

AlertDialogAction.displayName = "AlertDialog.Action";

/* ============================================
 * CANCEL
 * ============================================ */

export interface AlertDialogCancelProps extends ComponentPropsWithoutRef<"button"> {
  children?: ReactNode;
}

const AlertDialogCancel = forwardRef<HTMLButtonElement, AlertDialogCancelProps>(
  ({ children, className, onClick, ...props }, ref) => {
    const { setOpen } = useAlertDialog();

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      setOpen(false);
      onClick?.(e);
    };

    return (
      <button
        ref={ref}
        type="button"
        className={cn(styles.cancel, className)}
        onClick={handleClick}
        {...props}
      >
        {children}
      </button>
    );
  },
);

AlertDialogCancel.displayName = "AlertDialog.Cancel";

/* ============================================
 * EXPORTS
 * ============================================ */

export const AlertDialog = {
  Root: AlertDialogRoot,
  Trigger: AlertDialogTrigger,
  Content: AlertDialogContent,
  Header: AlertDialogHeader,
  Title: AlertDialogTitle,
  Description: AlertDialogDescription,
  Footer: AlertDialogFooter,
  Action: AlertDialogAction,
  Cancel: AlertDialogCancel,
};
