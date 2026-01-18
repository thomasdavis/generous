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
import styles from "./Combobox.module.css";
import { Portal } from "./Portal";

/* ============================================
 * CONTEXT
 * ============================================ */

interface ComboboxContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  value: string;
  setValue: (value: string) => void;
  search: string;
  setSearch: (search: string) => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
  contentRef: React.RefObject<HTMLDivElement | null>;
  contentId: string;
  size: "sm" | "md" | "lg";
  disabled: boolean;
}

const ComboboxContext = createContext<ComboboxContextValue | null>(null);

function useCombobox() {
  const context = useContext(ComboboxContext);
  if (!context) {
    throw new Error("Combobox components must be used within Combobox.Root");
  }
  return context;
}

/* ============================================
 * ROOT
 * ============================================ */

export interface ComboboxRootProps {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
  children?: ReactNode;
}

function ComboboxRoot({
  value: controlledValue,
  defaultValue = "",
  onValueChange,
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  disabled = false,
  size = "md",
  children,
}: ComboboxRootProps) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const [search, setSearch] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);

  const isValueControlled = controlledValue !== undefined;
  const isOpenControlled = controlledOpen !== undefined;

  const value = isValueControlled ? controlledValue : internalValue;
  const open = isOpenControlled ? controlledOpen : internalOpen;

  const id = useId();
  const contentId = `combobox-content-${id}`;

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
    <ComboboxContext.Provider
      value={{
        open,
        setOpen,
        value,
        setValue,
        search,
        setSearch,
        inputRef,
        contentRef,
        contentId,
        size,
        disabled,
      }}
    >
      {children}
    </ComboboxContext.Provider>
  );
}

ComboboxRoot.displayName = "Combobox.Root";

/* ============================================
 * INPUT
 * ============================================ */

export interface ComboboxInputProps extends Omit<ComponentPropsWithoutRef<"input">, "size"> {
  placeholder?: string;
}

const ComboboxInput = forwardRef<HTMLInputElement, ComboboxInputProps>(
  ({ placeholder, className, onChange, onFocus, onKeyDown, ...props }, ref) => {
    const { open, setOpen, search, setSearch, inputRef, contentId, size, disabled } = useCombobox();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearch(e.target.value);
      if (!open) setOpen(true);
      onChange?.(e);
    };

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setOpen(true);
      onFocus?.(e);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Escape") {
        setOpen(false);
      } else if (e.key === "ArrowDown" && !open) {
        setOpen(true);
      }
      onKeyDown?.(e);
    };

    return (
      <input
        ref={(node) => {
          inputRef.current = node;
          if (typeof ref === "function") ref(node);
          else if (ref) ref.current = node;
        }}
        type="text"
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={open ? contentId : undefined}
        aria-autocomplete="list"
        autoComplete="off"
        value={search}
        onChange={handleChange}
        onFocus={handleFocus}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        className={cn(styles.input, className)}
        {...dataAttrs({ size })}
        {...props}
      />
    );
  },
);

ComboboxInput.displayName = "Combobox.Input";

/* ============================================
 * CONTENT
 * ============================================ */

export interface ComboboxContentProps extends ComponentPropsWithoutRef<"div"> {
  children?: ReactNode;
}

const ComboboxContent = forwardRef<HTMLDivElement, ComboboxContentProps>(
  ({ children, className, style, ...props }, ref) => {
    const { open, setOpen, inputRef, contentRef, contentId } = useCombobox();
    const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });

    useEffect(() => {
      if (!open || !inputRef.current) return;

      const updatePosition = () => {
        const input = inputRef.current;
        if (!input) return;

        const rect = input.getBoundingClientRect();
        setPosition({
          top: rect.bottom + 4,
          left: rect.left,
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
    }, [open, inputRef]);

    useEffect(() => {
      if (!open) return;

      const handleClickOutside = (e: MouseEvent) => {
        const target = e.target as Node;
        if (
          contentRef.current &&
          !contentRef.current.contains(target) &&
          inputRef.current &&
          !inputRef.current.contains(target)
        ) {
          setOpen(false);
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [open, setOpen, inputRef, contentRef]);

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
            width: position.width,
          }}
          {...props}
        >
          {children}
        </div>
      </Portal>
    );
  },
);

ComboboxContent.displayName = "Combobox.Content";

/* ============================================
 * ITEM
 * ============================================ */

export interface ComboboxItemProps extends ComponentPropsWithoutRef<"div"> {
  value: string;
  disabled?: boolean;
  children?: ReactNode;
}

const ComboboxItem = forwardRef<HTMLDivElement, ComboboxItemProps>(
  ({ value: itemValue, disabled = false, children, className, onClick, ...props }, ref) => {
    const { value, setValue, setSearch, setOpen } = useCombobox();
    const isSelected = value === itemValue;

    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
      if (!disabled) {
        setValue(itemValue);
        setSearch(typeof children === "string" ? children : itemValue);
        setOpen(false);
      }
      onClick?.(e);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (!disabled && (e.key === "Enter" || e.key === " ")) {
        e.preventDefault();
        setValue(itemValue);
        setSearch(typeof children === "string" ? children : itemValue);
        setOpen(false);
      }
    };

    return (
      <div
        ref={ref}
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
        {children}
      </div>
    );
  },
);

ComboboxItem.displayName = "Combobox.Item";

/* ============================================
 * EMPTY
 * ============================================ */

export interface ComboboxEmptyProps extends ComponentPropsWithoutRef<"div"> {
  children?: ReactNode;
}

const ComboboxEmpty = forwardRef<HTMLDivElement, ComboboxEmptyProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <div ref={ref} className={cn(styles.empty, className)} {...props}>
        {children || "No results found."}
      </div>
    );
  },
);

ComboboxEmpty.displayName = "Combobox.Empty";

/* ============================================
 * EXPORTS
 * ============================================ */

export const Combobox = {
  Root: ComboboxRoot,
  Input: ComboboxInput,
  Content: ComboboxContent,
  Item: ComboboxItem,
  Empty: ComboboxEmpty,
};
