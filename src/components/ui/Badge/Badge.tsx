import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'sample';
}

const variantClasses = {
  default: 'bg-secondary-100 text-secondary-800 border-secondary-200',
  primary: 'bg-primary-50 text-primary-700 border-primary-200',
  secondary: 'bg-secondary-100 text-secondary-800 border-secondary-200',
  success: 'bg-success-100 text-success-700 border-success-200',
  warning: 'bg-warning-100 text-warning-700 border-warning-200',
  danger: 'bg-danger-100 text-danger-700 border-danger-200',
  info: 'bg-info-100 text-info-700 border-info-200',
  sample: 'bg-slate-100 text-slate-600 border-dashed border-slate-400 font-mono text-[10px]',
};

export function Badge({ className, variant = 'default', children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider',
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

