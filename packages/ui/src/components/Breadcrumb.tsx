"use client";

import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { forwardRef } from "react";
import { cn } from "../utils/cn";
import styles from "./Breadcrumb.module.css";

/* ============================================
 * ROOT
 * ============================================ */

export interface BreadcrumbRootProps extends ComponentPropsWithoutRef<"nav"> {
  children?: ReactNode;
}

const BreadcrumbRoot = forwardRef<HTMLElement, BreadcrumbRootProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <nav ref={ref} aria-label="Breadcrumb" className={cn(styles.root, className)} {...props}>
        {children}
      </nav>
    );
  },
);

BreadcrumbRoot.displayName = "Breadcrumb.Root";

/* ============================================
 * LIST
 * ============================================ */

export interface BreadcrumbListProps extends ComponentPropsWithoutRef<"ol"> {
  children?: ReactNode;
}

const BreadcrumbList = forwardRef<HTMLOListElement, BreadcrumbListProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <ol ref={ref} className={cn(styles.list, className)} {...props}>
        {children}
      </ol>
    );
  },
);

BreadcrumbList.displayName = "Breadcrumb.List";

/* ============================================
 * ITEM
 * ============================================ */

export interface BreadcrumbItemProps extends ComponentPropsWithoutRef<"li"> {
  children?: ReactNode;
}

const BreadcrumbItem = forwardRef<HTMLLIElement, BreadcrumbItemProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <li ref={ref} className={cn(styles.item, className)} {...props}>
        {children}
      </li>
    );
  },
);

BreadcrumbItem.displayName = "Breadcrumb.Item";

/* ============================================
 * LINK
 * ============================================ */

export interface BreadcrumbLinkProps extends ComponentPropsWithoutRef<"a"> {
  children?: ReactNode;
}

const BreadcrumbLink = forwardRef<HTMLAnchorElement, BreadcrumbLinkProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <a ref={ref} className={cn(styles.link, className)} {...props}>
        {children}
      </a>
    );
  },
);

BreadcrumbLink.displayName = "Breadcrumb.Link";

/* ============================================
 * PAGE (Current)
 * ============================================ */

export interface BreadcrumbPageProps extends ComponentPropsWithoutRef<"span"> {
  children?: ReactNode;
}

const BreadcrumbPage = forwardRef<HTMLSpanElement, BreadcrumbPageProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <span
        ref={ref}
        role="link"
        aria-current="page"
        aria-disabled="true"
        className={cn(styles.page, className)}
        {...props}
      >
        {children}
      </span>
    );
  },
);

BreadcrumbPage.displayName = "Breadcrumb.Page";

/* ============================================
 * SEPARATOR
 * ============================================ */

export interface BreadcrumbSeparatorProps extends ComponentPropsWithoutRef<"span"> {
  children?: ReactNode;
}

const BreadcrumbSeparator = forwardRef<HTMLSpanElement, BreadcrumbSeparatorProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <span
        ref={ref}
        role="presentation"
        aria-hidden="true"
        className={cn(styles.separator, className)}
        {...props}
      >
        {children || (
          <svg aria-hidden="true" viewBox="0 0 16 16" fill="none" className={styles.chevron}>
            <path
              d="M6 4l4 4-4 4"
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

BreadcrumbSeparator.displayName = "Breadcrumb.Separator";

/* ============================================
 * EXPORTS
 * ============================================ */

export const Breadcrumb = {
  Root: BreadcrumbRoot,
  List: BreadcrumbList,
  Item: BreadcrumbItem,
  Link: BreadcrumbLink,
  Page: BreadcrumbPage,
  Separator: BreadcrumbSeparator,
};
