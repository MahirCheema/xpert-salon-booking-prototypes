import { createContext } from 'react';
import type { ConfirmOptions } from './dialog.types';

export type ConfirmFunction = (options: ConfirmOptions) => Promise<boolean>;

export const ConfirmDialogContext = createContext<ConfirmFunction | null>(null);

