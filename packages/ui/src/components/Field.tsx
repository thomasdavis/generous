"use client";

import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { createContext, forwardRef, useContext, useId } from "react";
import { cn, dataAttrs } from "../utils/cn";
import styles from "./Field.module.css";

/* ============================================
 * CONTEXT
 * ============================================ */

interface FieldContextValue {
  id: string;
  error: boolean;
  disabled: boolean;
  required: boolean;
}

const FieldContext = createContext<FieldContextValue | null>(null);

export function useField() {
  return useContext(FieldContext);
}

/* ============================================
 * FIELD ROOT
 * ============================================ */

export interface FieldRootProps extends ComponentPropsWithoutRef<"div"> {
  /**
   * Whether the field is in error state
   */
  error?: boolean;
  /**
   * Whether the field is disabled
   */
  disabled?: boolean;
  /**
   * Whether the field is required
   */
  required?: boolean;
  children?: ReactNode;
}

const FieldRoot = forwardRef<HTMLDivElement, FieldRootProps>(
  ({ error = false, disabled = false, required = false, children, className, ...props }, ref) => {
    const id = useId();

    return (
      <FieldContext.Provider value={{ id, error, disabled, required }}>
        <div
          ref={ref}
          className={cn(styles.root, className)}
          {...dataAttrs({ error, disabled })}
          {...props}
        >
          {children}
        </div>
      </FieldContext.Provider>
    );
  },
);

FieldRoot.displayName = "Field.Root";

/* ============================================
 * FIELD LABEL
 * ============================================ */

export interface FieldLabelProps extends ComponentPropsWithoutRef<"label"> {
  /**
   * Whether to display as uppercase with wide tracking
   * @default false
   */
  uppercase?: boolean;
  children?: ReactNode;
}

const FieldLabel = forwardRef<HTMLLabelElement, FieldLabelProps>(
  ({ uppercase = false, children, className, ...props }, ref) => {
    const field = useField();

    return (
      <label
        ref={ref}
        htmlFor={field?.id}
        className={cn(styles.label, className)}
        {...dataAttrs({ uppercase })}
        {...props}
      >
        {children}
        {field?.required && (
          <span className={styles.required} aria-hidden="true">
            *
          </span>
        )}
      </label>
    );
  },
);

FieldLabel.displayName = "Field.Label";

/* ============================================
 * FIELD CONTROL
 * ============================================ */

export interface FieldControlProps extends ComponentPropsWithoutRef<"div"> {
  children?: ReactNode;
}

const FieldControl = forwardRef<HTMLDivElement, FieldControlProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <div ref={ref} className={cn(styles.control, className)} {...props}>
        {children}
      </div>
    );
  },
);

FieldControl.displayName = "Field.Control";

/* ============================================
 * FIELD DESCRIPTION
 * ============================================ */

export interface FieldDescriptionProps extends ComponentPropsWithoutRef<"p"> {
  children?: ReactNode;
}

const FieldDescription = forwardRef<HTMLParagraphElement, FieldDescriptionProps>(
  ({ children, className, ...props }, ref) => {
    const field = useField();

    return (
      <p
        ref={ref}
        id={field ? `${field.id}-description` : undefined}
        className={cn(styles.description, className)}
        {...props}
      >
        {children}
      </p>
    );
  },
);

FieldDescription.displayName = "Field.Description";

/* ============================================
 * FIELD ERROR MESSAGE
 * ============================================ */

export interface FieldErrorProps extends ComponentPropsWithoutRef<"p"> {
  children?: ReactNode;
}

const FieldError = forwardRef<HTMLParagraphElement, FieldErrorProps>(
  ({ children, className, ...props }, ref) => {
    const field = useField();

    if (!field?.error) return null;

    return (
      <p
        ref={ref}
        id={field ? `${field.id}-error` : undefined}
        role="alert"
        className={cn(styles.error, className)}
        {...props}
      >
        {children}
      </p>
    );
  },
);

FieldError.displayName = "Field.Error";

/* ============================================
 * EXPORTS
 * ============================================ */

export const Field = {
  Root: FieldRoot,
  Label: FieldLabel,
  Control: FieldControl,
  Description: FieldDescription,
  Error: FieldError,
};
