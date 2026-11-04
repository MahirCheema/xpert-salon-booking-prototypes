import type {
  ButtonHTMLAttributes,
  HTMLAttributes,
  ReactNode,
} from 'react';

export type DropdownAlign =
  | 'start'
  | 'center'
  | 'end';

export type DropdownSide =
  | 'top'
  | 'bottom';

export type DropdownItemVariant =
  | 'default'
  | 'danger';

export interface DropdownProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: ReactNode;
}

export interface DropdownTriggerProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  asChild?: boolean;
}

export interface DropdownContentProps
  extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  align?: DropdownAlign;
  side?: DropdownSide;
  sideOffset?: number;
  width?: 'auto' | 'sm' | 'md' | 'lg';
}

export interface DropdownItemProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  icon?: ReactNode;
  variant?: DropdownItemVariant;
  destructive?: boolean;
  closeOnSelect?: boolean;
}

export interface DropdownLabelProps
  extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export type DropdownSeparatorProps =
  HTMLAttributes<HTMLDivElement>;

export interface DropdownGroupProps
  extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

