"use client";

import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { forwardRef } from "react";
import { cn } from "../utils/cn";
import styles from "./Table.module.css";

/* ============================================
 * ROOT
 * ============================================ */

export interface TableRootProps extends ComponentPropsWithoutRef<"table"> {
  children?: ReactNode;
}

const TableRoot = forwardRef<HTMLTableElement, TableRootProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <div className={styles.wrapper}>
        <table ref={ref} className={cn(styles.root, className)} {...props}>
          {children}
        </table>
      </div>
    );
  },
);

TableRoot.displayName = "Table.Root";

/* ============================================
 * HEADER
 * ============================================ */

export interface TableHeaderProps extends ComponentPropsWithoutRef<"thead"> {
  children?: ReactNode;
}

const TableHeader = forwardRef<HTMLTableSectionElement, TableHeaderProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <thead ref={ref} className={cn(styles.header, className)} {...props}>
        {children}
      </thead>
    );
  },
);

TableHeader.displayName = "Table.Header";

/* ============================================
 * BODY
 * ============================================ */

export interface TableBodyProps extends ComponentPropsWithoutRef<"tbody"> {
  children?: ReactNode;
}

const TableBody = forwardRef<HTMLTableSectionElement, TableBodyProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <tbody ref={ref} className={cn(styles.body, className)} {...props}>
        {children}
      </tbody>
    );
  },
);

TableBody.displayName = "Table.Body";

/* ============================================
 * FOOTER
 * ============================================ */

export interface TableFooterProps extends ComponentPropsWithoutRef<"tfoot"> {
  children?: ReactNode;
}

const TableFooter = forwardRef<HTMLTableSectionElement, TableFooterProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <tfoot ref={ref} className={cn(styles.footer, className)} {...props}>
        {children}
      </tfoot>
    );
  },
);

TableFooter.displayName = "Table.Footer";

/* ============================================
 * ROW
 * ============================================ */

export interface TableRowProps extends ComponentPropsWithoutRef<"tr"> {
  children?: ReactNode;
}

const TableRow = forwardRef<HTMLTableRowElement, TableRowProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <tr ref={ref} className={cn(styles.row, className)} {...props}>
        {children}
      </tr>
    );
  },
);

TableRow.displayName = "Table.Row";

/* ============================================
 * HEAD
 * ============================================ */

export interface TableHeadProps extends ComponentPropsWithoutRef<"th"> {
  children?: ReactNode;
}

const TableHead = forwardRef<HTMLTableCellElement, TableHeadProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <th ref={ref} className={cn(styles.head, className)} {...props}>
        {children}
      </th>
    );
  },
);

TableHead.displayName = "Table.Head";

/* ============================================
 * CELL
 * ============================================ */

export interface TableCellProps extends ComponentPropsWithoutRef<"td"> {
  children?: ReactNode;
}

const TableCell = forwardRef<HTMLTableCellElement, TableCellProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <td ref={ref} className={cn(styles.cell, className)} {...props}>
        {children}
      </td>
    );
  },
);

TableCell.displayName = "Table.Cell";

/* ============================================
 * CAPTION
 * ============================================ */

export interface TableCaptionProps extends ComponentPropsWithoutRef<"caption"> {
  children?: ReactNode;
}

const TableCaption = forwardRef<HTMLTableCaptionElement, TableCaptionProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <caption ref={ref} className={cn(styles.caption, className)} {...props}>
        {children}
      </caption>
    );
  },
);

TableCaption.displayName = "Table.Caption";

/* ============================================
 * EXPORTS
 * ============================================ */

export const Table = {
  Root: TableRoot,
  Header: TableHeader,
  Body: TableBody,
  Footer: TableFooter,
  Row: TableRow,
  Head: TableHead,
  Cell: TableCell,
  Caption: TableCaption,
};
