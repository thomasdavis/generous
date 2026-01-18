"use client";

import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { createContext, forwardRef, useContext, useId, useMemo } from "react";
import { cn, dataAttrs } from "../utils/cn";
import styles from "./Form.module.css";

/* ============================================
 * TYPES
 * ============================================ */

type MessageVariant = "error" | "success" | "warning";

interface FormFieldContextValue {
  id: string;
  name?: string;
  required?: boolean;
  disabled?: boolean;
  hasError?: boolean;
  descriptionId?: string;
  messageId?: string;
}

/* ============================================
 * CONTEXT
 * ============================================ */

const FormFieldContext = createContext<FormFieldContextValue | null>(null);

function useFormFieldContext() {
  return useContext(FormFieldContext);
}

/**
 * Hook to get form field state for custom form controls
 */
export function useFormField() {
  const context = useFormFieldContext();
  return {
    id: context?.id,
    name: context?.name,
    required: context?.required,
    disabled: context?.disabled,
    hasError: context?.hasError,
    "aria-describedby":
      [context?.descriptionId, context?.messageId].filter(Boolean).join(" ") || undefined,
    "aria-invalid": context?.hasError || undefined,
    "aria-required": context?.required || undefined,
  };
}

/* ============================================
 * ROOT
 * ============================================ */

export interface FormRootProps extends ComponentPropsWithoutRef<"form"> {
  /**
   * Whether the form is in a disabled state
   */
  disabled?: boolean;
  /**
   * Whether the form is in a loading state
   */
  loading?: boolean;
  children?: ReactNode;
}

const FormRoot = forwardRef<HTMLFormElement, FormRootProps>(
  ({ disabled, loading, children, className, ...props }, ref) => {
    return (
      <form
        ref={ref}
        className={cn(styles.root, className)}
        {...dataAttrs({ disabled, loading })}
        {...props}
      >
        {children}
      </form>
    );
  },
);

FormRoot.displayName = "Form.Root";

/* ============================================
 * FIELD
 * ============================================ */

export interface FormFieldProps extends ComponentPropsWithoutRef<"div"> {
  /**
   * Name of the form field
   */
  name?: string;
  /**
   * Whether the field is required
   */
  required?: boolean;
  /**
   * Whether the field is disabled
   */
  disabled?: boolean;
  /**
   * Whether the field has an error
   */
  hasError?: boolean;
  /**
   * Layout orientation
   * @default "vertical"
   */
  orientation?: "vertical" | "horizontal";
  children?: ReactNode;
}

const FormField = forwardRef<HTMLDivElement, FormFieldProps>(
  (
    { name, required, disabled, hasError, orientation = "vertical", children, className, ...props },
    ref,
  ) => {
    const generatedId = useId();
    const id = name ? `field-${name}` : generatedId;
    const descriptionId = `${id}-description`;
    const messageId = `${id}-message`;

    const contextValue = useMemo(
      () => ({
        id,
        name,
        required,
        disabled,
        hasError,
        descriptionId,
        messageId,
      }),
      [id, name, required, disabled, hasError, descriptionId, messageId],
    );

    return (
      <FormFieldContext.Provider value={contextValue}>
        <div
          ref={ref}
          className={cn(styles.field, className)}
          {...dataAttrs({ orientation, disabled })}
          {...props}
        >
          {children}
        </div>
      </FormFieldContext.Provider>
    );
  },
);

FormField.displayName = "Form.Field";

/* ============================================
 * LABEL
 * ============================================ */

export interface FormLabelProps extends ComponentPropsWithoutRef<"label"> {
  children?: ReactNode;
}

const FormLabel = forwardRef<HTMLLabelElement, FormLabelProps>(
  ({ children, className, ...props }, ref) => {
    const context = useFormFieldContext();

    return (
      <label
        ref={ref}
        htmlFor={context?.id}
        className={cn(styles.label, className)}
        {...dataAttrs({ required: context?.required })}
        {...props}
      >
        {children}
      </label>
    );
  },
);

FormLabel.displayName = "Form.Label";

/* ============================================
 * CONTROL
 * ============================================ */

export interface FormControlProps extends ComponentPropsWithoutRef<"div"> {
  children?: ReactNode;
}

const FormControl = forwardRef<HTMLDivElement, FormControlProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <div ref={ref} className={cn(styles.control, className)} {...props}>
        {children}
      </div>
    );
  },
);

FormControl.displayName = "Form.Control";

/* ============================================
 * DESCRIPTION
 * ============================================ */

export interface FormDescriptionProps extends ComponentPropsWithoutRef<"p"> {
  children?: ReactNode;
}

const FormDescription = forwardRef<HTMLParagraphElement, FormDescriptionProps>(
  ({ children, className, ...props }, ref) => {
    const context = useFormFieldContext();

    return (
      <p
        ref={ref}
        id={context?.descriptionId}
        className={cn(styles.description, className)}
        {...props}
      >
        {children}
      </p>
    );
  },
);

FormDescription.displayName = "Form.Description";

/* ============================================
 * MESSAGE
 * ============================================ */

export interface FormMessageProps extends ComponentPropsWithoutRef<"p"> {
  /**
   * Message variant
   * @default "error"
   */
  variant?: MessageVariant;
  /**
   * Whether to show an icon
   * @default true
   */
  showIcon?: boolean;
  children?: ReactNode;
}

const FormMessage = forwardRef<HTMLParagraphElement, FormMessageProps>(
  ({ variant = "error", showIcon = true, children, className, ...props }, ref) => {
    const context = useFormFieldContext();

    if (!children) return null;

    return (
      <p
        ref={ref}
        id={context?.messageId}
        role={variant === "error" ? "alert" : undefined}
        className={cn(styles.message, className)}
        {...dataAttrs({ variant })}
        {...props}
      >
        {showIcon && (
          <span className={styles.messageIcon} aria-hidden="true">
            {variant === "error" && (
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
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            )}
            {variant === "success" && (
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
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            )}
            {variant === "warning" && (
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
                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            )}
          </span>
        )}
        {children}
      </p>
    );
  },
);

FormMessage.displayName = "Form.Message";

/* ============================================
 * FIELDSET
 * ============================================ */

export interface FormFieldsetProps extends ComponentPropsWithoutRef<"fieldset"> {
  children?: ReactNode;
}

const FormFieldset = forwardRef<HTMLFieldSetElement, FormFieldsetProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <fieldset ref={ref} className={cn(styles.fieldset, className)} {...props}>
        {children}
      </fieldset>
    );
  },
);

FormFieldset.displayName = "Form.Fieldset";

/* ============================================
 * LEGEND
 * ============================================ */

export interface FormLegendProps extends ComponentPropsWithoutRef<"legend"> {
  children?: ReactNode;
}

const FormLegend = forwardRef<HTMLLegendElement, FormLegendProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <legend ref={ref} className={cn(styles.legend, className)} {...props}>
        {children}
      </legend>
    );
  },
);

FormLegend.displayName = "Form.Legend";

/* ============================================
 * ACTIONS
 * ============================================ */

export interface FormActionsProps extends ComponentPropsWithoutRef<"div"> {
  /**
   * Alignment of actions
   * @default "start"
   */
  align?: "start" | "center" | "end" | "between";
  children?: ReactNode;
}

const FormActions = forwardRef<HTMLDivElement, FormActionsProps>(
  ({ align = "start", children, className, ...props }, ref) => {
    return (
      <div ref={ref} className={cn(styles.actions, className)} {...dataAttrs({ align })} {...props}>
        {children}
      </div>
    );
  },
);

FormActions.displayName = "Form.Actions";

/* ============================================
 * DIVIDER
 * ============================================ */

export interface FormDividerProps extends ComponentPropsWithoutRef<"div"> {}

const FormDivider = forwardRef<HTMLDivElement, FormDividerProps>(({ className, ...props }, ref) => {
  return <div ref={ref} role="separator" className={cn(styles.divider, className)} {...props} />;
});

FormDivider.displayName = "Form.Divider";

/* ============================================
 * SUBMIT (Convenience wrapper)
 * ============================================ */

export interface FormSubmitProps extends ComponentPropsWithoutRef<"button"> {
  /**
   * Whether the button should span full width
   */
  fullWidth?: boolean;
  children?: ReactNode;
}

const FormSubmit = forwardRef<HTMLButtonElement, FormSubmitProps>(
  ({ fullWidth, children, className, ...props }, ref) => {
    return (
      <button
        ref={ref}
        type="submit"
        className={cn(styles.submit, className)}
        {...dataAttrs({ fullWidth })}
        {...props}
      >
        {children}
      </button>
    );
  },
);

FormSubmit.displayName = "Form.Submit";

/* ============================================
 * EXPORTS
 * ============================================ */

export const Form = {
  Root: FormRoot,
  Field: FormField,
  Label: FormLabel,
  Control: FormControl,
  Description: FormDescription,
  Message: FormMessage,
  Fieldset: FormFieldset,
  Legend: FormLegend,
  Actions: FormActions,
  Divider: FormDivider,
  Submit: FormSubmit,
};
