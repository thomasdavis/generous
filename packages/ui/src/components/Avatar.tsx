"use client";

import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { forwardRef, useState } from "react";
import { cn, dataAttrs } from "../utils/cn";
import styles from "./Avatar.module.css";

/* ============================================
 * AVATAR ROOT
 * ============================================ */

export interface AvatarRootProps extends ComponentPropsWithoutRef<"span"> {
  /**
   * Size of the avatar
   * @default "md"
   */
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  children?: ReactNode;
}

const AvatarRoot = forwardRef<HTMLSpanElement, AvatarRootProps>(
  ({ size = "md", children, className, ...props }, ref) => {
    return (
      <span ref={ref} className={cn(styles.root, className)} {...dataAttrs({ size })} {...props}>
        {children}
      </span>
    );
  },
);

AvatarRoot.displayName = "Avatar.Root";

/* ============================================
 * AVATAR IMAGE
 * ============================================ */

export interface AvatarImageProps extends ComponentPropsWithoutRef<"img"> {
  /**
   * Callback when image fails to load
   */
  onLoadingStatusChange?: (status: "loading" | "loaded" | "error") => void;
}

const AvatarImage = forwardRef<HTMLImageElement, AvatarImageProps>(
  ({ src, alt, onLoadingStatusChange, className, ...props }, ref) => {
    const [status, setStatus] = useState<"loading" | "loaded" | "error">("loading");

    const handleLoad = () => {
      setStatus("loaded");
      onLoadingStatusChange?.("loaded");
    };

    const handleError = () => {
      setStatus("error");
      onLoadingStatusChange?.("error");
    };

    if (status === "error" || !src) {
      return null;
    }

    return (
      <img
        ref={ref}
        src={src}
        alt={alt}
        className={cn(styles.image, className)}
        onLoad={handleLoad}
        onError={handleError}
        {...props}
      />
    );
  },
);

AvatarImage.displayName = "Avatar.Image";

/* ============================================
 * AVATAR FALLBACK
 * ============================================ */

export interface AvatarFallbackProps extends ComponentPropsWithoutRef<"span"> {
  /**
   * Delay before showing fallback (ms)
   * Helps prevent flash of fallback for fast-loading images
   * @default 0
   */
  delayMs?: number;
  children?: ReactNode;
}

const AvatarFallback = forwardRef<HTMLSpanElement, AvatarFallbackProps>(
  ({ delayMs = 0, children, className, ...props }, ref) => {
    const [canRender, setCanRender] = useState(delayMs === 0);

    // Use effect to delay rendering
    if (delayMs > 0 && !canRender) {
      setTimeout(() => setCanRender(true), delayMs);
    }

    if (!canRender) {
      return null;
    }

    return (
      <span ref={ref} className={cn(styles.fallback, className)} {...props}>
        {children}
      </span>
    );
  },
);

AvatarFallback.displayName = "Avatar.Fallback";

/* ============================================
 * EXPORTS
 * ============================================ */

export const Avatar = {
  Root: AvatarRoot,
  Image: AvatarImage,
  Fallback: AvatarFallback,
};
