"use client";

import type { ComponentPropsWithoutRef } from "react";
import { forwardRef } from "react";
import { cn, dataAttrs } from "../utils/cn";
import styles from "./Skeleton.module.css";

export interface SkeletonProps extends ComponentPropsWithoutRef<"div"> {
  /**
   * Shape of the skeleton
   * @default "rectangle"
   */
  variant?: "rectangle" | "circle" | "text";
  /**
   * Whether to show shimmer animation
   * @default true
   */
  animate?: boolean;
  /**
   * Width of the skeleton (CSS value)
   */
  width?: string | number;
  /**
   * Height of the skeleton (CSS value)
   */
  height?: string | number;
}

/**
 * Skeleton provides a placeholder preview of content before the data loads.
 *
 * @example
 * <Skeleton width={200} height={20} />
 *
 * @example
 * // Circle avatar placeholder
 * <Skeleton variant="circle" width={40} height={40} />
 *
 * @example
 * // Text line placeholder
 * <Skeleton variant="text" width="100%" />
 */
export const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(
  ({ variant = "rectangle", animate = true, width, height, className, style, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(styles.root, className)}
        {...dataAttrs({ variant, animate })}
        style={{
          ...style,
          width: typeof width === "number" ? `${width}px` : width,
          height: typeof height === "number" ? `${height}px` : height,
        }}
        aria-hidden="true"
        {...props}
      />
    );
  },
);

Skeleton.displayName = "Skeleton";
