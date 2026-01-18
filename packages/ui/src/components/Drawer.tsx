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
import { cn, dataAttrs } from "../utils/cn";
import styles from "./Drawer.module.css";
import { FocusTrap } from "./FocusTrap";
import { Portal } from "./Portal";

/* ============================================
 * CONTEXT
 * ============================================ */

interface DrawerContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  titleId: string;
  descriptionId: string;
  side: "left" | "right" | "top" | "bottom";
}

const DrawerContext = createContext<DrawerContextValue | null>(null);

function useDrawer() {
  const context = useContext(DrawerContext);
  if (!context) {
    throw new Error("Drawer components must be used within Drawer.Root");
  }
  return context;
}

/* ============================================
 * ROOT
 * ============================================ */

export interface DrawerRootProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /**
   * Side from which the drawer slides in
   * @default "right"
   */
  side?: "left" | "right" | "top" | "bottom";
  children?: ReactNode;
}

function DrawerRoot({
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  side = "right",
  children,
}: DrawerRootProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;

  const id = useId();
  const titleId = `drawer-title-${id}`;
  const descriptionId = `drawer-description-${id}`;

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
    <DrawerContext.Provider value={{ open, setOpen, titleId, descriptionId, side }}>
      {children}
    </DrawerContext.Provider>
  );
}

DrawerRoot.displayName = "Drawer.Root";

/* ============================================
 * TRIGGER
 * ============================================ */

export interface DrawerTriggerProps extends ComponentPropsWithoutRef<"button"> {
  children?: ReactNode;
}

const DrawerTrigger = forwardRef<HTMLButtonElement, DrawerTriggerProps>(
  ({ children, className, onClick, ...props }, ref) => {
    const { setOpen } = useDrawer();

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

DrawerTrigger.displayName = "Drawer.Trigger";

/* ============================================
 * CONTENT
 * ============================================ */

export interface DrawerContentProps extends ComponentPropsWithoutRef<"div"> {
  children?: ReactNode;
}

const DrawerContent = forwardRef<HTMLDivElement, DrawerContentProps>(
  ({ children, className, ...props }, ref) => {
    const { open, setOpen, titleId, descriptionId, side } = useDrawer();

    const handleEscape = useCallback(() => {
      setOpen(false);
    }, [setOpen]);

    if (!open) return null;

    return (
      <Portal>
        <div className={styles.contentWrapper}>
          <div className={styles.overlay} onClick={() => setOpen(false)} aria-hidden="true" />
          <FocusTrap active={open} onEscape={handleEscape}>
            <div
              ref={ref}
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              aria-describedby={descriptionId}
              className={cn(styles.content, className)}
              {...dataAttrs({ side })}
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

DrawerContent.displayName = "Drawer.Content";

/* ============================================
 * HEADER
 * ============================================ */

export interface DrawerHeaderProps extends ComponentPropsWithoutRef<"div"> {
  children?: ReactNode;
}

const DrawerHeader = forwardRef<HTMLDivElement, DrawerHeaderProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <div ref={ref} className={cn(styles.header, className)} {...props}>
        {children}
      </div>
    );
  },
);

DrawerHeader.displayName = "Drawer.Header";

/* ============================================
 * TITLE
 * ============================================ */

export interface DrawerTitleProps extends ComponentPropsWithoutRef<"h2"> {
  children?: ReactNode;
}

const DrawerTitle = forwardRef<HTMLHeadingElement, DrawerTitleProps>(
  ({ children, className, ...props }, ref) => {
    const { titleId } = useDrawer();

    return (
      <h2 ref={ref} id={titleId} className={cn(styles.title, className)} {...props}>
        {children}
      </h2>
    );
  },
);

DrawerTitle.displayName = "Drawer.Title";

/* ============================================
 * DESCRIPTION
 * ============================================ */

export interface DrawerDescriptionProps extends ComponentPropsWithoutRef<"p"> {
  children?: ReactNode;
}

const DrawerDescription = forwardRef<HTMLParagraphElement, DrawerDescriptionProps>(
  ({ children, className, ...props }, ref) => {
    const { descriptionId } = useDrawer();

    return (
      <p ref={ref} id={descriptionId} className={cn(styles.description, className)} {...props}>
        {children}
      </p>
    );
  },
);

DrawerDescription.displayName = "Drawer.Description";

/* ============================================
 * BODY
 * ============================================ */

export interface DrawerBodyProps extends ComponentPropsWithoutRef<"div"> {
  children?: ReactNode;
}

const DrawerBody = forwardRef<HTMLDivElement, DrawerBodyProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <div ref={ref} className={cn(styles.body, className)} {...props}>
        {children}
      </div>
    );
  },
);

DrawerBody.displayName = "Drawer.Body";

/* ============================================
 * FOOTER
 * ============================================ */

export interface DrawerFooterProps extends ComponentPropsWithoutRef<"div"> {
  children?: ReactNode;
}

const DrawerFooter = forwardRef<HTMLDivElement, DrawerFooterProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <div ref={ref} className={cn(styles.footer, className)} {...props}>
        {children}
      </div>
    );
  },
);

DrawerFooter.displayName = "Drawer.Footer";

/* ============================================
 * CLOSE
 * ============================================ */

export interface DrawerCloseProps extends ComponentPropsWithoutRef<"button"> {
  children?: ReactNode;
}

const DrawerClose = forwardRef<HTMLButtonElement, DrawerCloseProps>(
  ({ children, className, onClick, ...props }, ref) => {
    const { setOpen } = useDrawer();

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

DrawerClose.displayName = "Drawer.Close";

/* ============================================
 * EXPORTS
 * ============================================ */

export const Drawer = {
  Root: DrawerRoot,
  Trigger: DrawerTrigger,
  Content: DrawerContent,
  Header: DrawerHeader,
  Title: DrawerTitle,
  Description: DrawerDescription,
  Body: DrawerBody,
  Footer: DrawerFooter,
  Close: DrawerClose,
};
