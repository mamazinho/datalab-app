import { createContext, use } from 'react';

export interface IConfirmOptions {
  title: string;
  message: string;
  confirmLabel?: string;
}

export type ConfirmFn = (options: IConfirmOptions) => Promise<boolean>;

export const ConfirmContext = createContext<ConfirmFn | null>(null);

export const useConfirm = () => {
  const confirm = use(ConfirmContext);

  if (!confirm) {
    throw new Error('useConfirm must be used within a ConfirmProvider');
  }

  return confirm;
};
