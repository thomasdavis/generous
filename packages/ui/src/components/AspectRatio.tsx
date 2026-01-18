"use client";

import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { forwardRef } from "react";
import { cn } from "../utils/cn";
import styles from "./AspectRatio.module.css";

export interface AspectRatioProps extends ComponentPropsWithoutRef<"div"> {
  /**
   * The aspect ratio (width / height)
   * @default 1
   * @example 16/9, 4/3, 1
   */
  ratio?: number;
  children?: ReactNode;
}

/**
 * AspectRatio maintains a consistent width-to-height ratio.
 *
 * @example
 * <AspectRatio ratio={16/9}>
 *   <img src="..." alt="..." />
 * </AspectRatio>
 *
 * @example
 * <AspectRatio ratio={1}>
 *   <div>Square content</div>
 * </AspectRatio>
 */
export const AspectRatio = forwardRef<HTMLDivElement, AspectRatioProps>(
  ({ ratio = 1, children, className, style, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(styles.root, className)}
        style={
          {
            ...style,
            "--aspect-ratio": ratio,
          } as React.CSSProperties
        }
        {...props}
      >
        {children}
      </div>
    );
  },
);

AspectRatio.displayName = "AspectRatio";
