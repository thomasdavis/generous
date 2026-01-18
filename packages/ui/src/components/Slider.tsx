"use client";

import type { ComponentPropsWithoutRef, PointerEvent } from "react";
import { forwardRef, useCallback, useRef, useState } from "react";
import { cn, dataAttrs } from "../utils/cn";
import styles from "./Slider.module.css";

export interface SliderProps
  extends Omit<ComponentPropsWithoutRef<"div">, "onChange" | "defaultValue"> {
  /**
   * The controlled value
   */
  value?: number[];
  /**
   * The default value (uncontrolled)
   */
  defaultValue?: number[];
  /**
   * Callback when value changes
   */
  onValueChange?: (value: number[]) => void;
  /**
   * Callback when interaction ends
   */
  onValueCommit?: (value: number[]) => void;
  /**
   * Minimum value
   * @default 0
   */
  min?: number;
  /**
   * Maximum value
   * @default 100
   */
  max?: number;
  /**
   * Step increment
   * @default 1
   */
  step?: number;
  /**
   * Size of the slider
   * @default "md"
   */
  size?: "sm" | "md" | "lg";
  /**
   * Orientation
   * @default "horizontal"
   */
  orientation?: "horizontal" | "vertical";
  /**
   * Whether the slider is disabled
   */
  disabled?: boolean;
}

/**
 * Slider allows users to select a value from a range.
 *
 * @example
 * const [value, setValue] = useState([50]);
 * <Slider value={value} onValueChange={setValue} />
 *
 * @example
 * // Range slider
 * <Slider defaultValue={[25, 75]} />
 */
export const Slider = forwardRef<HTMLDivElement, SliderProps>(
  (
    {
      value: controlledValue,
      defaultValue = [0],
      onValueChange,
      onValueCommit,
      min = 0,
      max = 100,
      step = 1,
      size = "md",
      orientation = "horizontal",
      disabled = false,
      className,
      ...props
    },
    ref,
  ) => {
    const trackRef = useRef<HTMLDivElement>(null);
    const [internalValue, setInternalValue] = useState(defaultValue);
    const [activeThumb, setActiveThumb] = useState<number | null>(null);

    const isControlled = controlledValue !== undefined;
    const value = isControlled ? controlledValue : internalValue;

    // Calculate percentage for positioning
    const getPercentage = useCallback(
      (val: number) => ((val - min) / (max - min)) * 100,
      [min, max],
    );

    // Get value from pointer position
    const getValueFromPointer = useCallback(
      (pointerPosition: number) => {
        if (!trackRef.current) return 0;

        const rect = trackRef.current.getBoundingClientRect();
        const trackLength = orientation === "horizontal" ? rect.width : rect.height;
        const trackStart = orientation === "horizontal" ? rect.left : rect.bottom;

        let percentage: number;
        if (orientation === "horizontal") {
          percentage = (pointerPosition - trackStart) / trackLength;
        } else {
          percentage = (trackStart - pointerPosition) / trackLength;
        }

        percentage = Math.max(0, Math.min(1, percentage));
        const rawValue = min + percentage * (max - min);
        return Math.round(rawValue / step) * step;
      },
      [min, max, step, orientation],
    );

    const updateValue = useCallback(
      (thumbIndex: number, newThumbValue: number) => {
        const newValue = [...value];
        newValue[thumbIndex] = Math.max(min, Math.min(max, newThumbValue));

        // Sort values if multiple thumbs
        if (newValue.length > 1) {
          newValue.sort((a, b) => a - b);
        }

        if (!isControlled) {
          setInternalValue(newValue);
        }
        onValueChange?.(newValue);
      },
      [value, min, max, isControlled, onValueChange],
    );

    const handlePointerDown = (e: PointerEvent, thumbIndex: number) => {
      if (disabled) return;
      e.preventDefault();
      setActiveThumb(thumbIndex);
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (activeThumb === null || disabled) return;
      const pointerPosition = orientation === "horizontal" ? e.clientX : e.clientY;
      const newValue = getValueFromPointer(pointerPosition);
      updateValue(activeThumb, newValue);
    };

    const handlePointerUp = () => {
      if (activeThumb !== null) {
        setActiveThumb(null);
        onValueCommit?.(value);
      }
    };

    const handleTrackClick = (e: PointerEvent) => {
      if (disabled) return;
      const pointerPosition = orientation === "horizontal" ? e.clientX : e.clientY;
      const clickValue = getValueFromPointer(pointerPosition);

      // Find closest thumb
      let closestIndex = 0;
      const firstValue = value[0] ?? 0;
      let closestDistance = Math.abs(firstValue - clickValue);
      for (let i = 1; i < value.length; i++) {
        const currentValue = value[i] ?? 0;
        const distance = Math.abs(currentValue - clickValue);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = i;
        }
      }

      updateValue(closestIndex, clickValue);
      onValueCommit?.(value);
    };

    // Calculate range fill
    const rangeStart = value.length > 1 ? getPercentage(value[0] ?? 0) : 0;
    const rangeEnd = getPercentage(value[value.length - 1] ?? 0);

    return (
      <div
        ref={ref}
        className={cn(styles.root, className)}
        {...dataAttrs({ size, orientation, disabled })}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        {...props}
      >
        <div ref={trackRef} className={styles.track} onPointerDown={handleTrackClick}>
          <div
            className={styles.range}
            style={
              orientation === "horizontal"
                ? { left: `${rangeStart}%`, right: `${100 - rangeEnd}%` }
                : { bottom: `${rangeStart}%`, top: `${100 - rangeEnd}%` }
            }
          />
        </div>
        {value.map((val, index) => (
          <div
            key={index}
            role="slider"
            tabIndex={disabled ? -1 : 0}
            aria-valuemin={min}
            aria-valuemax={max}
            aria-valuenow={val}
            aria-orientation={orientation}
            aria-disabled={disabled}
            className={styles.thumb}
            style={
              orientation === "horizontal"
                ? { left: `${getPercentage(val)}%` }
                : { bottom: `${getPercentage(val)}%` }
            }
            onPointerDown={(e) => handlePointerDown(e, index)}
            data-active={activeThumb === index ? "true" : undefined}
          />
        ))}
      </div>
    );
  },
);

Slider.displayName = "Slider";
