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
  useRef,
  useState,
} from "react";
import { cn, dataAttrs } from "../utils/cn";
import { Portal } from "./Portal";
import styles from "./Select.module.css";

/* ============================================
 * CONTEXT
 * ============================================ */

interface SelectContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  value: string;
  setValue: (value: string) => void;
  valueLabel: string;
  setValueLabel: (label: string) => void;
  triggerId: string;
  contentId: string;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
  disabled: boolean;
  size: "sm" | "md" | "lg";
  error: boolean;
}

const SelectContext = createContext<SelectContextValue | null>(null);

function useSelect() {
  const context = useContext(SelectContext);
  if (!context) {
    throw new Error("Select components must be used within Select.Root");
  }
  return context;
}

/* ============================================
 * ROOT
 * ============================================ */

export interface SelectRootProps {
  /**
   * Controlled value
   */
  value?: string;
  /**
   * Default value (uncontrolled)
   */
  defaultValue?: string;
  /**
   * Callback when value changes
   */
  onValueChange?: (value: string) => void;
  /**
   * Controlled open state
   */
  open?: boolean;
  /**
   * Default open state
   */
  defaultOpen?: boolean;
  /**
   * Callback when open state changes
   */
  onOpenChange?: (open: boolean) => void;
  /**
   * Whether the select is disabled
   */
  disabled?: boolean;
  /**
   * Size of the select
   * @default "md"
   */
  size?: "sm" | "md" | "lg";
  /**
   * Whether the select is in error state
   */
  error?: boolean;
  children?: ReactNode;
}

function SelectRoot({
  value: controlledValue,
  defaultValue = "",
  onValueChange,
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  disabled = false,
  size = "md",
  error = false,
  children,
}: SelectRootProps) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const [valueLabel, setValueLabel] = useState("");
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  const isValueControlled = controlledValue !== undefined;
  const isOpenControlled = controlledOpen !== undefined;

  const value = isValueControlled ? controlledValue : internalValue;
  const open = isOpenControlled ? controlledOpen : internalOpen;

  const id = useId();
  const triggerId = `select-trigger-${id}`;
  const contentId = `select-content-${id}`;

  const setValue = useCallback(
    (newValue: string) => {
      if (!isValueControlled) {
        setInternalValue(newValue);
      }
      onValueChange?.(newValue);
    },
    [isValueControlled, onValueChange],
  );

  const setOpen = useCallback(
    (newOpen: boolean) => {
      if (!isOpenControlled) {
        setInternalOpen(newOpen);
      }
      onOpenChange?.(newOpen);
    },
    [isOpenControlled, onOpenChange],
  );

  return (
    <SelectContext.Provider
      value={{
        open,
        setOpen,
        value,
        setValue,
        valueLabel,
        setValueLabel,
        triggerId,
        contentId,
        triggerRef,
        disabled,
        size,
        error,
      }}
    >
      {children}
    </SelectContext.Provider>
  );
}

SelectRoot.displayName = "Select.Root";

/* ============================================
 * TRIGGER
 * ============================================ */

export interface SelectTriggerProps extends ComponentPropsWithoutRef<"button"> {
  children?: ReactNode;
}

const SelectTrigger = forwardRef<HTMLButtonElement, SelectTriggerProps>(
  ({ children, className, onClick, ...props }, ref) => {
    const { open, setOpen, triggerId, contentId, triggerRef, disabled, size, error } = useSelect();

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (!disabled) {
        setOpen(!open);
      }
      onClick?.(e);
    };

    return (
      <button
        ref={(node) => {
          triggerRef.current = node;
          if (typeof ref === "function") ref(node);
          else if (ref) ref.current = node;
        }}
        type="button"
        id={triggerId}
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={open ? contentId : undefined}
        aria-disabled={disabled}
        disabled={disabled}
        className={cn(styles.trigger, className)}
        onClick={handleClick}
        {...dataAttrs({ size, error, open })}
        {...props}
      >
        {children}
      </button>
    );
  },
);

SelectTrigger.displayName = "Select.Trigger";

/* ============================================
 * VALUE
 * ============================================ */

export interface SelectValueProps extends ComponentPropsWithoutRef<"span"> {
  /**
   * Placeholder text when no value is selected
   */
  placeholder?: string;
}

const SelectValue = forwardRef<HTMLSpanElement, SelectValueProps>(
  ({ placeholder, className, ...props }, ref) => {
    const { valueLabel } = useSelect();

    return (
      <span
        ref={ref}
        className={cn(styles.value, className)}
        data-placeholder={!valueLabel ? "" : undefined}
        {...props}
      >
        {valueLabel || placeholder}
      </span>
    );
  },
);

SelectValue.displayName = "Select.Value";

/* ============================================
 * ICON
 * ============================================ */

export interface SelectIconProps extends ComponentPropsWithoutRef<"span"> {
  children?: ReactNode;
}

const SelectIcon = forwardRef<HTMLSpanElement, SelectIconProps>(
  ({ children, className, ...props }, ref) => {
    const { open } = useSelect();

    return (
      <span
        ref={ref}
        className={cn(styles.icon, className)}
        aria-hidden="true"
        {...dataAttrs({ open })}
        {...props}
      >
        {children || (
          <svg aria-hidden="true" viewBox="0 0 16 16" fill="none" className={styles.chevron}>
            <path
              d="M4 6l4 4 4-4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </span>
    );
  },
);

SelectIcon.displayName = "Select.Icon";

/* ============================================
 * CONTENT
 * ============================================ */

export interface SelectContentProps extends ComponentPropsWithoutRef<"div"> {
  /**
   * Alignment relative to trigger
   * @default "start"
   */
  align?: "start" | "center" | "end";
  /**
   * Side offset from trigger
   * @default 4
   */
  sideOffset?: number;
  children?: ReactNode;
}

const SelectContent = forwardRef<HTMLDivElement, SelectContentProps>(
  ({ align = "start", sideOffset = 4, children, className, style, ...props }, ref) => {
    const { open, setOpen, contentId, triggerRef } = useSelect();
    const contentRef = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });

    // Calculate position
    useEffect(() => {
      if (!open || !triggerRef.current) return;

      const updatePosition = () => {
        const trigger = triggerRef.current;
        if (!trigger) return;

        const rect = trigger.getBoundingClientRect();
        const contentEl = contentRef.current;
        const contentWidth = contentEl?.offsetWidth || rect.width;

        let left = rect.left;
        if (align === "center") {
          left = rect.left + rect.width / 2 - contentWidth / 2;
        } else if (align === "end") {
          left = rect.right - contentWidth;
        }

        // Keep in viewport
        const padding = 8;
        left = Math.max(padding, Math.min(left, window.innerWidth - contentWidth - padding));

        setPosition({
          top: rect.bottom + sideOffset,
          left,
          width: rect.width,
        });
      };

      updatePosition();
      window.addEventListener("resize", updatePosition);
      window.addEventListener("scroll", updatePosition, true);

      return () => {
        window.removeEventListener("resize", updatePosition);
        window.removeEventListener("scroll", updatePosition, true);
      };
    }, [open, align, sideOffset, triggerRef]);

    // Close on outside click
    useEffect(() => {
      if (!open) return;

      const handleClickOutside = (e: MouseEvent) => {
        const target = e.target as Node;
        if (
          contentRef.current &&
          !contentRef.current.contains(target) &&
          triggerRef.current &&
          !triggerRef.current.contains(target)
        ) {
          setOpen(false);
        }
      };

      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          setOpen(false);
          triggerRef.current?.focus();
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);

      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
        document.removeEventListener("keydown", handleEscape);
      };
    }, [open, setOpen, triggerRef]);

    if (!open) return null;

    return (
      <Portal>
        <div
          ref={(node) => {
            contentRef.current = node;
            if (typeof ref === "function") ref(node);
            else if (ref) ref.current = node;
          }}
          id={contentId}
          role="listbox"
          className={cn(styles.content, className)}
          style={{
            ...style,
            position: "fixed",
            top: position.top,
            left: position.left,
            minWidth: position.width,
          }}
          {...props}
        >
          {children}
        </div>
      </Portal>
    );
  },
);

SelectContent.displayName = "Select.Content";

/* ============================================
 * ITEM
 * ============================================ */

export interface SelectItemProps extends ComponentPropsWithoutRef<"div"> {
  /**
   * Value of this item
   */
  value: string;
  /**
   * Whether this item is disabled
   */
  disabled?: boolean;
  children?: ReactNode;
}

const SelectItem = forwardRef<HTMLDivElement, SelectItemProps>(
  ({ value: itemValue, disabled = false, children, className, onClick, ...props }, ref) => {
    const { value, setValue, setValueLabel, setOpen } = useSelect();
    const isSelected = value === itemValue;
    const itemRef = useRef<HTMLDivElement>(null);

    // Update label when this item is selected
    useEffect(() => {
      if (isSelected && itemRef.current) {
        setValueLabel(itemRef.current.textContent || "");
      }
    }, [isSelected, setValueLabel]);

    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
      if (!disabled) {
        setValue(itemValue);
        setOpen(false);
      }
      onClick?.(e);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (!disabled && (e.key === "Enter" || e.key === " ")) {
        e.preventDefault();
        setValue(itemValue);
        setOpen(false);
      }
    };

    return (
      <div
        ref={(node) => {
          itemRef.current = node;
          if (typeof ref === "function") ref(node);
          else if (ref) ref.current = node;
        }}
        role="option"
        aria-selected={isSelected}
        aria-disabled={disabled}
        tabIndex={disabled ? -1 : 0}
        className={cn(styles.item, className)}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        {...dataAttrs({ selected: isSelected, disabled })}
        {...props}
      >
        <span className={styles.itemText}>{children}</span>
        {isSelected && (
          <span className={styles.itemIndicator} aria-hidden="true">
            <svg aria-hidden="true" viewBox="0 0 16 16" fill="none">
              <path
                d="M3.5 8.5l3 3 6-7"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        )}
      </div>
    );
  },
);

SelectItem.displayName = "Select.Item";

/* ============================================
 * GROUP
 * ============================================ */

export interface SelectGroupProps extends ComponentPropsWithoutRef<"div"> {
  children?: ReactNode;
}

const SelectGroup = forwardRef<HTMLDivElement, SelectGroupProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <div ref={ref} role="group" className={cn(styles.group, className)} {...props}>
        {children}
      </div>
    );
  },
);

SelectGroup.displayName = "Select.Group";

/* ============================================
 * LABEL
 * ============================================ */

export interface SelectLabelProps extends ComponentPropsWithoutRef<"div"> {
  children?: ReactNode;
}

const SelectLabel = forwardRef<HTMLDivElement, SelectLabelProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <div ref={ref} className={cn(styles.label, className)} {...props}>
        {children}
      </div>
    );
  },
);

SelectLabel.displayName = "Select.Label";

/* ============================================
 * SEPARATOR
 * ============================================ */

export interface SelectSeparatorProps extends ComponentPropsWithoutRef<"div"> {}

const SelectSeparator = forwardRef<HTMLDivElement, SelectSeparatorProps>(
  ({ className, ...props }, ref) => {
    return (
      <div ref={ref} role="separator" className={cn(styles.separator, className)} {...props} />
    );
  },
);

SelectSeparator.displayName = "Select.Separator";

/* ============================================
 * EXPORTS
 * ============================================ */

export const Select = {
  Root: SelectRoot,
  Trigger: SelectTrigger,
  Value: SelectValue,
  Icon: SelectIcon,
  Content: SelectContent,
  Item: SelectItem,
  Group: SelectGroup,
  Label: SelectLabel,
  Separator: SelectSeparator,
};
