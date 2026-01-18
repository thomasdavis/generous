"use client";

import type { ComponentPropsWithoutRef, ReactNode } from "react";
import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useState,
} from "react";
import { cn, dataAttrs } from "../utils/cn";
import styles from "./Toast.module.css";

/* ============================================
 * TYPES
 * ============================================ */

type ToastVariant = "default" | "success" | "error" | "warning" | "info";
type ToastPosition =
  | "top-left"
  | "top-center"
  | "top-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right";

interface ToastData {
  id: string;
  title?: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
  action?: ReactNode;
  onClose?: () => void;
}

interface ToastContextValue {
  toasts: ToastData[];
  addToast: (toast: Omit<ToastData, "id">) => string;
  removeToast: (id: string) => void;
  removeAllToasts: () => void;
}

/* ============================================
 * CONTEXT
 * ============================================ */

const ToastContext = createContext<ToastContextValue | null>(null);

function useToastContext() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("Toast components must be used within a Toast.Provider");
  }
  return context;
}

/**
 * Hook to access toast functions
 */
export function useToast() {
  return useToastContext();
}

/* ============================================
 * PROVIDER
 * ============================================ */

export interface ToastProviderProps {
  children: ReactNode;
  /**
   * Maximum number of toasts to show at once
   * @default 5
   */
  maxToasts?: number;
}

const ToastProvider = ({ children, maxToasts = 5 }: ToastProviderProps) => {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const addToast = useCallback(
    (toast: Omit<ToastData, "id">) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      setToasts((prev) => {
        const newToasts = [...prev, { ...toast, id }];
        // Keep only the most recent maxToasts
        return newToasts.slice(-maxToasts);
      });
      return id;
    },
    [maxToasts],
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const removeAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  const value = useMemo(
    () => ({ toasts, addToast, removeToast, removeAllToasts }),
    [toasts, addToast, removeToast, removeAllToasts],
  );

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
};

ToastProvider.displayName = "Toast.Provider";

/* ============================================
 * VIEWPORT
 * ============================================ */

export interface ToastViewportProps extends ComponentPropsWithoutRef<"div"> {
  /**
   * Position of the toast container
   * @default "bottom-right"
   */
  position?: ToastPosition;
  /**
   * Label for screen readers
   * @default "Notifications"
   */
  label?: string;
}

const ToastViewport = forwardRef<HTMLDivElement, ToastViewportProps>(
  ({ position = "bottom-right", label = "Notifications", className, children, ...props }, ref) => {
    const { toasts } = useToastContext();

    return (
      <div
        ref={ref}
        role="region"
        aria-label={label}
        className={cn(styles.viewport, className)}
        {...dataAttrs({ position })}
        {...props}
      >
        {toasts.map((toast) => (
          <ToastItem key={toast.id} {...toast} />
        ))}
        {children}
      </div>
    );
  },
);

ToastViewport.displayName = "Toast.Viewport";

/* ============================================
 * TOAST ITEM (Internal)
 * ============================================ */

interface ToastItemProps extends ToastData {
  className?: string;
}

const ToastItem = ({
  id,
  title,
  description,
  variant = "default",
  duration = 5000,
  action,
  onClose,
  className,
}: ToastItemProps) => {
  const { removeToast } = useToastContext();
  const [state, setState] = useState<"open" | "closing">("open");
  const [progress, setProgress] = useState(100);
  const titleId = useId();
  const descriptionId = useId();

  const handleClose = useCallback(() => {
    setState("closing");
    setTimeout(() => {
      removeToast(id);
      onClose?.();
    }, 200); // Match animation duration
  }, [id, removeToast, onClose]);

  // Auto-dismiss timer with progress
  useEffect(() => {
    if (duration === 0) return;

    const startTime = Date.now();
    const endTime = startTime + duration;

    const updateProgress = () => {
      const now = Date.now();
      const remaining = endTime - now;
      const newProgress = (remaining / duration) * 100;

      if (newProgress <= 0) {
        handleClose();
      } else {
        setProgress(newProgress);
        requestAnimationFrame(updateProgress);
      }
    };

    const animationId = requestAnimationFrame(updateProgress);

    return () => cancelAnimationFrame(animationId);
  }, [duration, handleClose]);

  return (
    <div
      role="alert"
      aria-labelledby={title ? titleId : undefined}
      aria-describedby={description ? descriptionId : undefined}
      className={cn(styles.root, className)}
      {...dataAttrs({ variant, state })}
    >
      <div className={styles.content}>
        {title && (
          <p id={titleId} className={styles.title}>
            {title}
          </p>
        )}
        {description && (
          <p id={descriptionId} className={styles.description}>
            {description}
          </p>
        )}
      </div>

      {action && <div className={styles.action}>{action}</div>}

      <button
        type="button"
        className={styles.close}
        onClick={handleClose}
        aria-label="Dismiss notification"
      >
        <svg
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M18 6 6 18" />
          <path d="m6 6 12 12" />
        </svg>
      </button>

      {duration > 0 && (
        <div className={styles.progress}>
          <div className={styles.progressBar} style={{ width: `${progress}%` }} />
        </div>
      )}
    </div>
  );
};

/* ============================================
 * ROOT (Standalone toast for manual control)
 * ============================================ */

export interface ToastRootProps extends ComponentPropsWithoutRef<"div"> {
  /**
   * Visual style variant
   * @default "default"
   */
  variant?: ToastVariant;
  /**
   * Whether the toast is open
   */
  open?: boolean;
  /**
   * Callback when the toast should close
   */
  onOpenChange?: (open: boolean) => void;
  children?: ReactNode;
}

const ToastRoot = forwardRef<HTMLDivElement, ToastRootProps>(
  ({ variant = "default", open = true, onOpenChange, children, className, ...props }, ref) => {
    const [state, setState] = useState<"open" | "closing">("open");
    const _titleId = useId();
    const _descriptionId = useId();

    useEffect(() => {
      if (!open && state === "open") {
        setState("closing");
        const timer = setTimeout(() => {
          onOpenChange?.(false);
        }, 200);
        return () => clearTimeout(timer);
      }
      if (open) {
        setState("open");
      }
    }, [open, state, onOpenChange]);

    if (!open && state !== "closing") {
      return null;
    }

    return (
      <div
        ref={ref}
        role="alert"
        className={cn(styles.root, className)}
        {...dataAttrs({ variant, state })}
        {...props}
      >
        {children}
      </div>
    );
  },
);

ToastRoot.displayName = "Toast.Root";

/* ============================================
 * TITLE
 * ============================================ */

export interface ToastTitleProps extends ComponentPropsWithoutRef<"p"> {
  children?: ReactNode;
}

const ToastTitle = forwardRef<HTMLParagraphElement, ToastTitleProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <p ref={ref} className={cn(styles.title, className)} {...props}>
        {children}
      </p>
    );
  },
);

ToastTitle.displayName = "Toast.Title";

/* ============================================
 * DESCRIPTION
 * ============================================ */

export interface ToastDescriptionProps extends ComponentPropsWithoutRef<"p"> {
  children?: ReactNode;
}

const ToastDescription = forwardRef<HTMLParagraphElement, ToastDescriptionProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <p ref={ref} className={cn(styles.description, className)} {...props}>
        {children}
      </p>
    );
  },
);

ToastDescription.displayName = "Toast.Description";

/* ============================================
 * ACTION
 * ============================================ */

export interface ToastActionProps extends ComponentPropsWithoutRef<"div"> {
  children?: ReactNode;
}

const ToastAction = forwardRef<HTMLDivElement, ToastActionProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <div ref={ref} className={cn(styles.action, className)} {...props}>
        {children}
      </div>
    );
  },
);

ToastAction.displayName = "Toast.Action";

/* ============================================
 * CLOSE
 * ============================================ */

export interface ToastCloseProps extends ComponentPropsWithoutRef<"button"> {
  children?: ReactNode;
}

const ToastClose = forwardRef<HTMLButtonElement, ToastCloseProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <button
        ref={ref}
        type="button"
        className={cn(styles.close, className)}
        aria-label="Dismiss notification"
        {...props}
      >
        {children || (
          <svg
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        )}
      </button>
    );
  },
);

ToastClose.displayName = "Toast.Close";

/* ============================================
 * EXPORTS
 * ============================================ */

export const Toast = {
  Provider: ToastProvider,
  Viewport: ToastViewport,
  Root: ToastRoot,
  Title: ToastTitle,
  Description: ToastDescription,
  Action: ToastAction,
  Close: ToastClose,
};
