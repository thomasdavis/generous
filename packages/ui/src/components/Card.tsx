"use client";

import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { forwardRef } from "react";
import { cn, dataAttrs } from "../utils/cn";
import styles from "./Card.module.css";

/* ============================================
 * ROOT
 * ============================================ */

export interface CardRootProps extends ComponentPropsWithoutRef<"div"> {
  /**
   * Visual style variant
   * @default "default"
   */
  variant?: "default" | "outline" | "elevated";
  /**
   * Whether the card is interactive (hover effects)
   * @default false
   */
  interactive?: boolean;
  children?: ReactNode;
}

const CardRoot = forwardRef<HTMLDivElement, CardRootProps>(
  ({ variant = "default", interactive = false, children, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(styles.root, className)}
        {...dataAttrs({ variant, interactive })}
        {...props}
      >
        {children}
      </div>
    );
  },
);

CardRoot.displayName = "Card.Root";

/* ============================================
 * HEADER
 * ============================================ */

export interface CardHeaderProps extends ComponentPropsWithoutRef<"div"> {
  children?: ReactNode;
}

const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <div ref={ref} className={cn(styles.header, className)} {...props}>
        {children}
      </div>
    );
  },
);

CardHeader.displayName = "Card.Header";

/* ============================================
 * TITLE
 * ============================================ */

export interface CardTitleProps extends ComponentPropsWithoutRef<"h3"> {
  children?: ReactNode;
}

const CardTitle = forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <h3 ref={ref} className={cn(styles.title, className)} {...props}>
        {children}
      </h3>
    );
  },
);

CardTitle.displayName = "Card.Title";

/* ============================================
 * DESCRIPTION
 * ============================================ */

export interface CardDescriptionProps extends ComponentPropsWithoutRef<"p"> {
  children?: ReactNode;
}

const CardDescription = forwardRef<HTMLParagraphElement, CardDescriptionProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <p ref={ref} className={cn(styles.description, className)} {...props}>
        {children}
      </p>
    );
  },
);

CardDescription.displayName = "Card.Description";

/* ============================================
 * CONTENT
 * ============================================ */

export interface CardContentProps extends ComponentPropsWithoutRef<"div"> {
  children?: ReactNode;
}

const CardContent = forwardRef<HTMLDivElement, CardContentProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <div ref={ref} className={cn(styles.content, className)} {...props}>
        {children}
      </div>
    );
  },
);

CardContent.displayName = "Card.Content";

/* ============================================
 * FOOTER
 * ============================================ */

export interface CardFooterProps extends ComponentPropsWithoutRef<"div"> {
  children?: ReactNode;
}

const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <div ref={ref} className={cn(styles.footer, className)} {...props}>
        {children}
      </div>
    );
  },
);

CardFooter.displayName = "Card.Footer";

/* ============================================
 * EXPORTS
 * ============================================ */

export const Card = {
  Root: CardRoot,
  Header: CardHeader,
  Title: CardTitle,
  Description: CardDescription,
  Content: CardContent,
  Footer: CardFooter,
};
