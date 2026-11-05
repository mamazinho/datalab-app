import type { ReactNode } from 'react';
import { useCallback, useEffect, useState } from 'react';
import { ConfirmDialog } from '../../components/UI/ConfirmDialog';
import { ConfirmContext, type ConfirmFn, type IConfirmOptions } from './contexts';

interface IPendingConfirm extends IConfirmOptions {
  resolve: (confirmed: boolean) => void;
}

export const ConfirmProvider = ({ children }: { children: ReactNode }) => {
  const [pending, setPending] = useState<IPendingConfirm | null>(null);

  const confirm = useCallback<ConfirmFn>(
    (options) => new Promise((resolve) => setPending({ ...options, resolve })),
    [],
  );

  const settle = useCallback(
    (confirmed: boolean) => {
      pending?.resolve(confirmed);
      setPending(null);
    },
    [pending],
  );

  // Capture runs before the Escape listener of a modal underneath, which would close along with this one
  useEffect(() => {
    if (!pending) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      event.stopPropagation();
      settle(false);
    };

    window.addEventListener('keydown', handleEscape, true);
    return () => window.removeEventListener('keydown', handleEscape, true);
  }, [pending, settle]);

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <ConfirmDialog
        isOpen={pending !== null}
        title={pending?.title ?? ''}
        message={pending?.message ?? ''}
        confirmLabel={pending?.confirmLabel ?? 'Confirmar'}
        onConfirm={() => settle(true)}
        onCancel={() => settle(false)}
      />
    </ConfirmContext.Provider>
  );
};
