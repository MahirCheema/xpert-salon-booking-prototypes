import { useContext } from 'react';
import { ConfirmDialogContext, type ConfirmFunction } from './ConfirmDialogContext';

export function useConfirm(): ConfirmFunction {
  const context = useContext(ConfirmDialogContext);
  if (!context) {
    throw new Error('useConfirm must be used within a ConfirmDialogProvider');
  }
  return context;
}

