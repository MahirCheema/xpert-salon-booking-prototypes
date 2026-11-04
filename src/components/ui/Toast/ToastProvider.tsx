import { useState, useCallback, useRef, useEffect, useMemo, type ReactNode } from 'react';
import { ToastContext, type ToastContextValue, type ToastFunction } from './ToastContext';
import { Toast } from './Toast';
import { cn } from '@/lib/utils/cn';
import type { ToastItem, ToastOptions, ToastPosition, ToastProviderProps } from './toast.types';

const positionClasses: Record<ToastPosition, string> = {
  'top-left': 'left-4 top-4 items-start',
  'top-center': 'left-1/2 top-4 -translate-x-1/2 items-center',
  'top-right': 'right-4 top-4 items-end',
  'bottom-left': 'bottom-4 left-4 items-start',
  'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2 items-center',
  'bottom-right': 'bottom-4 right-4 items-end',
};

function isToastOptions(value: ToastOptions | ReactNode): value is ToastOptions {
  return typeof value === 'object' && value !== null && !Array.isArray(value) && !('$$typeof' in value);
}

function normalizeToast(input: ToastOptions | ReactNode, id: string, defaultDuration: number): ToastItem {
  if (isToastOptions(input)) {
    return {
      id,
      title: input.title,
      description: input.description,
      variant: input.variant ?? 'default',
      duration: input.duration ?? defaultDuration,
      dismissible: input.dismissible ?? true,
    };
  }

  return {
    id,
    description: input,
    variant: 'default',
    duration: defaultDuration,
    dismissible: true,
  };
}

export function ToastProvider({
  children,
  position = 'bottom-right',
  duration = 4000,
  maxToasts = 3,
}: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timersRef = useRef<Map<string, number>>(new Map());

  const dismiss = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
    const timer = timersRef.current.get(id);
    if (timer !== undefined) {
      window.clearTimeout(timer);
      timersRef.current.delete(id);
    }
  }, []);

  const dismissAll = useCallback(() => {
    setToasts([]);
    timersRef.current.forEach((timer) => window.clearTimeout(timer));
    timersRef.current.clear();
  }, []);

  const rawToast = useCallback(
    (input: ToastOptions | ReactNode) => {
      const id = 'toast-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 6);
      const newToast = normalizeToast(input, id, duration);

      setToasts((current) => {
        const next = [newToast, ...current];
        if (next.length > maxToasts) {
          return next.slice(0, maxToasts);
        }
        return next;
      });

      if (newToast.duration && newToast.duration > 0) {
        const timer = window.setTimeout(() => {
          dismiss(id);
        }, newToast.duration);
        timersRef.current.set(id, timer);
      }

      return id;
    },
    [dismiss, duration, maxToasts]
  );

  const toast = useMemo<ToastFunction>(() => {
    const fn = (input: ToastOptions | ReactNode) => rawToast(input);
    fn.success = (titleOrMsg: string | ToastOptions, description?: string) => {
      return typeof titleOrMsg === 'string'
        ? rawToast({ title: titleOrMsg, description, variant: 'success' })
        : rawToast({ ...titleOrMsg, variant: 'success' });
    };
    fn.error = (titleOrMsg: string | ToastOptions, description?: string) => {
      return typeof titleOrMsg === 'string'
        ? rawToast({ title: titleOrMsg, description, variant: 'danger' })
        : rawToast({ ...titleOrMsg, variant: 'danger' });
    };
    fn.warning = (titleOrMsg: string | ToastOptions, description?: string) => {
      return typeof titleOrMsg === 'string'
        ? rawToast({ title: titleOrMsg, description, variant: 'warning' })
        : rawToast({ ...titleOrMsg, variant: 'warning' });
    };
    fn.info = (titleOrMsg: string | ToastOptions, description?: string) => {
      return typeof titleOrMsg === 'string'
        ? rawToast({ title: titleOrMsg, description, variant: 'info' })
        : rawToast({ ...titleOrMsg, variant: 'info' });
    };
    return fn as ToastFunction;
  }, [rawToast]);

  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
      timers.clear();
    };
  }, []);

  const contextValue = useMemo<ToastContextValue>(
    () => ({ toast, dismiss, dismissAll }),
    [toast, dismiss, dismissAll]
  );

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <div
        className={cn(
          'pointer-events-none fixed z-100 flex w-full max-w-sm flex-col gap-2 p-4',
          positionClasses[position]
        )}
        aria-label="Notifications"
      >
        {toasts.map((item) => (
          <Toast key={item.id} toast={item} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

