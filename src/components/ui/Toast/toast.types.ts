import type { ReactNode } from 'react';

export type ToastVariant = 'default' | 'success' | 'warning' | 'danger' | 'info';

export type ToastPosition =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right';

export interface ToastOptions {
  title?: string;
  description?: ReactNode;
  variant?: ToastVariant;
  duration?: number;
  dismissible?: boolean;
}

export interface ToastItem {
  id: string;
  title?: string;
  description?: ReactNode;
  variant: ToastVariant;
  duration: number;
  dismissible: boolean;
}

export interface ToastProps {
  toast: ToastItem;
  onDismiss: (id: string) => void;
}

export interface ToastProviderProps {
  children: ReactNode;
  position?: ToastPosition;
  duration?: number;
  maxToasts?: number;
}

