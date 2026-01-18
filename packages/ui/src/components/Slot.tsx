"use client";

import {
  Children,
  cloneElement,
  forwardRef,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from "react";
import { cn } from "../utils/cn";

export interface SlotProps {
  /**
   * The child element to merge props with.
   * Must be a single React element.
   */
  children?: ReactNode;
  [key: string]: unknown;
}

/**
 * Merges its props onto its immediate child.
 * Similar to Radix UI's Slot component.
 *
 * This is useful for creating components that can render as different elements
 * while passing through props like className, event handlers, etc.
 *
 * @example
 * // The Button will receive the Slot's className
 * <Slot className="custom-class">
 *   <Button>Click me</Button>
 * </Slot>
 *
 * @example
 * // Use with asChild pattern
 * const Button = ({ asChild, ...props }) => {
 *   const Comp = asChild ? Slot : "button";
 *   return <Comp {...props} />;
 * };
 *
 * <Button asChild>
 *   <a href="/home">Home</a>
 * </Button>
 */
export const Slot = forwardRef<HTMLElement, SlotProps>(
  ({ children, ...slotProps }, forwardedRef) => {
    // Get the single child
    const child = Children.only(children);

    if (!isValidElement(child)) {
      console.warn("Slot expects a single valid React element as a child");
      return null;
    }

    // Merge props
    const childProps = (child.props ?? {}) as Record<string, unknown>;
    const mergedProps = mergeProps(slotProps, childProps);

    // Handle ref merging
    const ref = forwardedRef
      ? composeRefs(forwardedRef, (child as { ref?: React.Ref<HTMLElement> }).ref)
      : (child as { ref?: React.Ref<HTMLElement> }).ref;

    return cloneElement(
      child as ReactElement<{ ref?: React.Ref<HTMLElement> }>,
      {
        ...mergedProps,
        ref,
      } as { ref?: React.Ref<HTMLElement> },
    );
  },
);

Slot.displayName = "Slot";

/**
 * Slottable marks content that should be replaced by asChild children.
 * Used in components that support both default and custom rendering.
 *
 * @example
 * const Button = ({ asChild, children, icon, ...props }) => {
 *   const Comp = asChild ? Slot : "button";
 *   return (
 *     <Comp {...props}>
 *       {icon}
 *       <Slottable>{children}</Slottable>
 *     </Comp>
 *   );
 * };
 */
export function Slottable({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

Slottable.displayName = "Slottable";

// Helper function to merge props
function mergeProps(
  slotProps: Record<string, unknown>,
  childProps: Record<string, unknown>,
): Record<string, unknown> {
  const merged: Record<string, unknown> = { ...childProps };

  for (const [key, slotValue] of Object.entries(slotProps)) {
    const childValue = childProps[key];

    // Merge className
    if (key === "className") {
      merged[key] = cn(slotValue as string, childValue as string);
      continue;
    }

    // Merge style
    if (key === "style") {
      merged[key] = { ...(slotValue as object), ...(childValue as object) };
      continue;
    }

    // Merge event handlers
    if (key.startsWith("on") && typeof slotValue === "function") {
      if (typeof childValue === "function") {
        merged[key] = (...args: unknown[]) => {
          (childValue as (...args: unknown[]) => void)(...args);
          (slotValue as (...args: unknown[]) => void)(...args);
        };
      } else {
        merged[key] = slotValue;
      }
      continue;
    }

    // Slot props override child props (except for the cases above)
    if (slotValue !== undefined) {
      merged[key] = slotValue;
    }
  }

  return merged;
}

// Helper function to compose refs
function composeRefs<T>(...refs: (React.Ref<T> | undefined)[]): React.RefCallback<T> {
  return (value) => {
    for (const ref of refs) {
      if (typeof ref === "function") {
        ref(value);
      } else if (ref !== null && ref !== undefined) {
        (ref as React.MutableRefObject<T | null>).current = value;
      }
    }
  };
}
