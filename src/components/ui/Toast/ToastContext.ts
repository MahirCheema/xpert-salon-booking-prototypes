import { createContext, type ReactNode } from 'react';
import type { ToastOptions } from './toast.types';

export interface ToastFunction {
  (options: ToastOptions | ReactNode): string;
  success: (titleOrMsg: string | ToastOptions, description?: string) => string;
  error: (titleOrMsg: string | ToastOptions, description?: string) => string;
  warning: (titleOrMsg: string | ToastOptions, description?: string) => string;
  info: (titleOrMsg: string | ToastOptions, description?: string) => string;
}

export interface ToastContextValue {
  toast: ToastFunction;
  dismiss: (id: string) => void;
  dismissAll: () => void;
}

export const ToastContext = createContext<ToastContextValue | null>(null);

