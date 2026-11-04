import type { ReactNode } from 'react';
import { AlertCircle, CheckCircle2, Info, X, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import type { ToastProps, ToastVariant } from './toast.types';

const variantConfig: Record<
  ToastVariant,
  {
    icon: ReactNode;
    iconClassName: string;
    containerClassName: string;
  }
> = {
  default: {
    icon: <Info className="h-5 w-5" />,
    iconClassName: 'text-secondary-600',
    containerClassName: 'border-secondary-200 bg-white text-secondary-900',
  },
  success: {
    icon: <CheckCircle2 className="h-5 w-5" />,
    iconClassName: 'text-success-600',
    containerClassName: 'border-success-200 bg-success-50 text-secondary-900',
  },
  warning: {
    icon: <AlertCircle className="h-5 w-5" />,
    iconClassName: 'text-warning-600',
    containerClassName: 'border-warning-200 bg-warning-50 text-secondary-900',
  },
  danger: {
    icon: <XCircle className="h-5 w-5" />,
    iconClassName: 'text-danger-600',
    containerClassName: 'border-danger-200 bg-danger-50 text-secondary-900',
  },
  info: {
    icon: <Info className="h-5 w-5" />,
    iconClassName: 'text-info-600',
    containerClassName: 'border-info-200 bg-info-50 text-secondary-900',
  },
};

export function Toast({ toast, onDismiss }: ToastProps) {
  const { id, title, description, variant = 'default', dismissible = true } = toast;
  const config = variantConfig[variant] || variantConfig.default;

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border p-4 shadow-lg transition-all',
        config.containerClassName
      )}
    >
      <div className={cn('mt-0.5 shrink-0', config.iconClassName)} aria-hidden="true">
        {config.icon}
      </div>

      <div className="min-w-0 flex-1">
        {title && <p className="text-sm font-semibold">{title}</p>}
        {description && (
          <div className={cn('text-sm text-secondary-600', title && 'mt-0.5')}>
            {description}
          </div>
        )}
      </div>

      {dismissible && (
        <button
          type="button"
          aria-label="Dismiss notification"
          onClick={() => onDismiss(id)}
          className="shrink-0 rounded-md p-1 text-secondary-400 hover:bg-secondary-100 hover:text-secondary-700"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

