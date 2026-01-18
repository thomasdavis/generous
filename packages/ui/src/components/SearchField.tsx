"use client";

import type { ComponentPropsWithoutRef, KeyboardEvent } from "react";
import { forwardRef, useCallback, useRef, useState } from "react";
import { cn, dataAttrs } from "../utils/cn";
import styles from "./SearchField.module.css";

export interface SearchFieldProps
  extends Omit<ComponentPropsWithoutRef<"input">, "type" | "onChange" | "size"> {
  /**
   * The controlled value
   */
  value?: string;
  /**
   * The default value (uncontrolled)
   */
  defaultValue?: string;
  /**
   * Callback when value changes
   */
  onValueChange?: (value: string) => void;
  /**
   * Callback when search is submitted (Enter key)
   */
  onSearch?: (value: string) => void;
  /**
   * Callback when the clear button is clicked
   */
  onClear?: () => void;
  /**
   * Size of the search field
   * @default "md"
   */
  size?: "sm" | "md" | "lg";
  /**
   * Whether to show the clear button when there's a value
   * @default true
   */
  showClear?: boolean;
}

/**
 * SearchField is a specialized input for search queries.
 *
 * @example
 * const [query, setQuery] = useState("");
 * <SearchField
 *   value={query}
 *   onValueChange={setQuery}
 *   onSearch={(value) => console.log("Search:", value)}
 *   placeholder="Search..."
 * />
 */
export const SearchField = forwardRef<HTMLInputElement, SearchFieldProps>(
  (
    {
      value: controlledValue,
      defaultValue = "",
      onValueChange,
      onSearch,
      onClear,
      size = "md",
      showClear = true,
      disabled,
      className,
      placeholder = "Search...",
      ...props
    },
    ref,
  ) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [internalValue, setInternalValue] = useState(defaultValue);
    const isControlled = controlledValue !== undefined;
    const value = isControlled ? controlledValue : internalValue;

    const updateValue = useCallback(
      (newValue: string) => {
        if (!isControlled) {
          setInternalValue(newValue);
        }
        onValueChange?.(newValue);
      },
      [isControlled, onValueChange],
    );

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      updateValue(e.target.value);
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && onSearch) {
        e.preventDefault();
        onSearch(value);
      }
    };

    const handleClear = () => {
      updateValue("");
      onClear?.();
      // Focus the input after clearing
      const refElement = (ref as React.RefObject<HTMLInputElement>)?.current;
      if (refElement) {
        refElement.focus();
      } else {
        inputRef.current?.focus();
      }
    };

    const hasValue = value.length > 0;

    return (
      <div className={cn(styles.root, className)} {...dataAttrs({ size, disabled })}>
        <span className={styles.searchIcon} aria-hidden="true">
          <svg aria-hidden="true" viewBox="0 0 16 16" fill="none" className={styles.icon}>
            <path
              d="M7 12A5 5 0 107 2a5 5 0 000 10zM14 14l-3.5-3.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <input
          ref={ref || inputRef}
          type="search"
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={placeholder}
          className={styles.input}
          {...props}
        />
        {showClear && hasValue && !disabled && (
          <button
            type="button"
            className={styles.clearButton}
            onClick={handleClear}
            tabIndex={-1}
            aria-label="Clear search"
          >
            <svg aria-hidden="true" viewBox="0 0 16 16" fill="none" className={styles.icon}>
              <path
                d="M4 4l8 8M12 4l-8 8"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        )}
      </div>
    );
  },
);

SearchField.displayName = "SearchField";
