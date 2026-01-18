"use client";

/**
 * Sheet is an alias for Drawer, provided for API familiarity.
 * Both components have identical functionality.
 */

export type {
  DrawerBodyProps as SheetBodyProps,
  DrawerCloseProps as SheetCloseProps,
  DrawerContentProps as SheetContentProps,
  DrawerDescriptionProps as SheetDescriptionProps,
  DrawerFooterProps as SheetFooterProps,
  DrawerHeaderProps as SheetHeaderProps,
  DrawerRootProps as SheetRootProps,
  DrawerTitleProps as SheetTitleProps,
  DrawerTriggerProps as SheetTriggerProps,
} from "./Drawer";
export { Drawer as Sheet } from "./Drawer";
