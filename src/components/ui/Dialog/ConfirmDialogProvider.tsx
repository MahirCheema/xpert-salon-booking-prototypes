import { useState, useCallback, useRef, type ReactNode } from 'react';
import { ConfirmDialog } from './ConfirmDialog';
import { ConfirmDialogContext } from './ConfirmDialogContext';
import type { ConfirmOptions } from './dialog.types';

export function ConfirmDialogProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions>({
    title: '',
    description: '',
  });

  const resolverRef = useRef<((value: boolean) => void) | null>(null);

  const confirm = useCallback((opts: ConfirmOptions): Promise<boolean> => {
    setOptions(opts);
    setIsOpen(true);

    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve;
    });
  }, []);

  const handleConfirm = () => {
    resolverRef.current?.(true);
    resolverRef.current = null;
    setIsOpen(false);
  };

  const handleCancel = () => {
    resolverRef.current?.(false);
    resolverRef.current = null;
    setIsOpen(false);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      handleCancel();
    } else {
      setIsOpen(true);
    }
  };

  return (
    <ConfirmDialogContext.Provider value={confirm}>
      {children}
      <ConfirmDialog
        open={isOpen}
        onOpenChange={handleOpenChange}
        title={options.title}
        description={options.description}
        confirmText={options.confirmText}
        cancelText={options.cancelText}
        variant={options.variant}
        icon={options.icon}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      >
        {options.content}
      </ConfirmDialog>
    </ConfirmDialogContext.Provider>
  );
}

