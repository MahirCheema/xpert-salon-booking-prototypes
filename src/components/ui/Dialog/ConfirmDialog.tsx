import { useState } from 'react';
import { AlertCircle, AlertTriangle, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { Dialog, DialogContent, DialogFooter, DialogTitle, DialogDescription } from './Dialog';
import type { ConfirmDialogProps, ConfirmVariant } from './dialog.types';

const variantConfig: Record<
  ConfirmVariant,
  {
    icon: typeof AlertTriangle;
    iconClass: string;
    buttonClass: string;
  }
> = {
  danger: {
    icon: AlertTriangle,
    iconClass: 'bg-danger-50 text-danger-600 border border-danger-200',
    buttonClass: 'bg-danger-600 hover:bg-danger-700 text-white',
  },
  warning: {
    icon: AlertCircle,
    iconClass: 'bg-warning-50 text-warning-600 border border-warning-200',
    buttonClass: 'bg-warning-600 hover:bg-warning-700 text-white',
  },
  primary: {
    icon: HelpCircle,
    iconClass: 'bg-primary-50 text-primary-600 border border-primary-200',
    buttonClass: 'bg-primary-600 hover:bg-primary-700 text-white',
  },
};

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  icon,
  isLoading: externalLoading,
  onConfirm,
  onCancel,
  children,
}: ConfirmDialogProps) {
  const [internalLoading, setInternalLoading] = useState(false);
  const isLoading = externalLoading ?? internalLoading;

  const config = variantConfig[variant] || variantConfig.danger;
  const IconComponent = config.icon;

  const handleCancel = () => {
    if (isLoading) return;
    onCancel?.();
    onOpenChange(false);
  };

  const handleConfirm = async () => {
    try {
      setInternalLoading(true);
      await onConfirm();
      onOpenChange(false);
    } catch (error) {
      console.error('Confirm action failed:', error);
    } finally {
      setInternalLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showClose={!isLoading} onClose={handleCancel}>
        <div className="flex gap-4 p-6 sm:p-7">
          <div
            className={cn(
              'flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl shadow-xs',
              config.iconClass
            )}
            aria-hidden="true"
          >
            {icon || <IconComponent className="h-5 w-5" />}
          </div>

          <div className="min-w-0 flex-1">
            <DialogTitle>{title}</DialogTitle>
            {description && <DialogDescription>{description}</DialogDescription>}
            {children && <div className="mt-4">{children}</div>}
          </div>
        </div>

        <DialogFooter>
          <button
            type="button"
            onClick={handleCancel}
            disabled={isLoading}
            className="rounded-lg border border-secondary-300 bg-white px-4 py-2 text-sm font-semibold text-secondary-700 hover:bg-secondary-50 disabled:opacity-50"
          >
            {cancelText}
          </button>

          <button
            type="button"
            onClick={() => void handleConfirm()}
            disabled={isLoading}
            className={cn(
              'inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold shadow-sm transition-all disabled:opacity-50',
              config.buttonClass
            )}
          >
            {isLoading ? 'Verwerken...' : confirmText}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

