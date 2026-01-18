"use client";

import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { forwardRef } from "react";
import { cn, dataAttrs } from "../utils/cn";
import styles from "./Pagination.module.css";

/* ============================================
 * ROOT
 * ============================================ */

export interface PaginationRootProps extends ComponentPropsWithoutRef<"nav"> {
  children?: ReactNode;
}

const PaginationRoot = forwardRef<HTMLElement, PaginationRootProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <nav ref={ref} aria-label="Pagination" className={cn(styles.root, className)} {...props}>
        {children}
      </nav>
    );
  },
);

PaginationRoot.displayName = "Pagination.Root";

/* ============================================
 * CONTENT
 * ============================================ */

export interface PaginationContentProps extends ComponentPropsWithoutRef<"ul"> {
  children?: ReactNode;
}

const PaginationContent = forwardRef<HTMLUListElement, PaginationContentProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <ul ref={ref} className={cn(styles.content, className)} {...props}>
        {children}
      </ul>
    );
  },
);

PaginationContent.displayName = "Pagination.Content";

/* ============================================
 * ITEM
 * ============================================ */

export interface PaginationItemProps extends ComponentPropsWithoutRef<"li"> {
  children?: ReactNode;
}

const PaginationItem = forwardRef<HTMLLIElement, PaginationItemProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <li ref={ref} className={cn(styles.item, className)} {...props}>
        {children}
      </li>
    );
  },
);

PaginationItem.displayName = "Pagination.Item";

/* ============================================
 * LINK
 * ============================================ */

export interface PaginationLinkProps extends ComponentPropsWithoutRef<"a"> {
  isActive?: boolean;
  children?: ReactNode;
}

const PaginationLink = forwardRef<HTMLAnchorElement, PaginationLinkProps>(
  ({ isActive = false, children, className, ...props }, ref) => {
    return (
      <a
        ref={ref}
        aria-current={isActive ? "page" : undefined}
        className={cn(styles.link, className)}
        {...dataAttrs({ active: isActive })}
        {...props}
      >
        {children}
      </a>
    );
  },
);

PaginationLink.displayName = "Pagination.Link";

/* ============================================
 * PREVIOUS
 * ============================================ */

export interface PaginationPreviousProps extends ComponentPropsWithoutRef<"a"> {
  children?: ReactNode;
}

const PaginationPrevious = forwardRef<HTMLAnchorElement, PaginationPreviousProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <a
        ref={ref}
        aria-label="Go to previous page"
        className={cn(styles.navLink, className)}
        {...props}
      >
        <svg aria-hidden="true" viewBox="0 0 16 16" fill="none" className={styles.navIcon}>
          <path
            d="M10 12L6 8l4-4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        {children || <span>Previous</span>}
      </a>
    );
  },
);

PaginationPrevious.displayName = "Pagination.Previous";

/* ============================================
 * NEXT
 * ============================================ */

export interface PaginationNextProps extends ComponentPropsWithoutRef<"a"> {
  children?: ReactNode;
}

const PaginationNext = forwardRef<HTMLAnchorElement, PaginationNextProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <a
        ref={ref}
        aria-label="Go to next page"
        className={cn(styles.navLink, className)}
        {...props}
      >
        {children || <span>Next</span>}
        <svg aria-hidden="true" viewBox="0 0 16 16" fill="none" className={styles.navIcon}>
          <path
            d="M6 4l4 4-4 4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </a>
    );
  },
);

PaginationNext.displayName = "Pagination.Next";

/* ============================================
 * ELLIPSIS
 * ============================================ */

export interface PaginationEllipsisProps extends ComponentPropsWithoutRef<"span"> {}

const PaginationEllipsis = forwardRef<HTMLSpanElement, PaginationEllipsisProps>(
  ({ className, ...props }, ref) => {
    return (
      <span ref={ref} aria-hidden="true" className={cn(styles.ellipsis, className)} {...props}>
        ...
      </span>
    );
  },
);

PaginationEllipsis.displayName = "Pagination.Ellipsis";

/* ============================================
 * EXPORTS
 * ============================================ */

export const Pagination = {
  Root: PaginationRoot,
  Content: PaginationContent,
  Item: PaginationItem,
  Link: PaginationLink,
  Previous: PaginationPrevious,
  Next: PaginationNext,
  Ellipsis: PaginationEllipsis,
};
