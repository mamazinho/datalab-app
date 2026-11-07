import type { ReactNode } from 'react';
import { useEffect, useEffectEvent, useState } from 'react';
import { ConfirmDialog } from '../../components/UI/ConfirmDialog';
import { ConfirmContext, type ConfirmFn, type IConfirmOptions } from './contexts';

interface IPendingConfirm extends IConfirmOptions {
  resolve: (confirmed: boolean) => void;
}

export const ConfirmProvider = ({ children }: { children: ReactNode }) => {
  const [pending, setPending] = useState<IPendingConfirm | null>(null);

  const confirm: ConfirmFn = (options) => new Promise((resolve) => setPending({ ...options, resolve }));

  const settle = (confirmed: boolean) => {
    pending?.resolve(confirmed);
    setPending(null);
  };

  const isOpen = pending !== null;

  const handleEscape = useEffectEvent((event: KeyboardEvent) => {
    if (event.key !== 'Escape') return;
    event.stopPropagation();
    settle(false);
  });

  // Capture runs before the Escape listener of a modal underneath, which would close along with this one
  useEffect(() => {
    if (!isOpen) return;

    const listener = (event: KeyboardEvent) => handleEscape(event);
    window.addEventListener('keydown', listener, true);
    return () => window.removeEventListener('keydown', listener, true);
  }, [isOpen]);

  return (
    <ConfirmContext value={confirm}>
      {children}
      <ConfirmDialog
        isOpen={isOpen}
        title={pending?.title ?? ''}
        message={pending?.message ?? ''}
        confirmLabel={pending?.confirmLabel ?? 'Confirmar'}
        onConfirm={() => settle(true)}
        onCancel={() => settle(false)}
      />
    </ConfirmContext>
  );
};
