import { startTransition, useOptimistic, useState } from 'react';
import { toast } from 'react-toastify';
import { useQueryClient, type QueryKey } from '@tanstack/react-query';
import { toastRequestError } from '../components/Feedback/ErrorToast';

interface IRowAction<T> {
  id: string;
  request: () => Promise<unknown>;
  successMessage: string;
  // What the row turns into while the request runs; null takes it off the list
  optimistic?: T | null;
}

interface IOptimisticChange<T> {
  id: string;
  row: T | null;
}

const applyChange = <T extends { id: string }>(rows: T[], { id, row }: IOptimisticChange<T>): T[] =>
  row ? rows.map((current) => (current.id === id ? row : current)) : rows.filter((current) => current.id !== id);

// The row stays busy until the list refetches, so it never flashes back to its old state
export function useRowActions<T extends { id: string }>(queryKey: QueryKey, rows: T[] = []) {
  const queryClient = useQueryClient();
  const [busyIds, setBusyIds] = useState<ReadonlySet<string>>(new Set());
  const [optimisticRows, showChange] = useOptimistic(rows, applyChange<T>);

  const run = ({ id, request, successMessage, optimistic }: IRowAction<T>) => {
    setBusyIds((ids) => new Set(ids).add(id));
    startTransition(async () => {
      if (optimistic !== undefined) showChange({ id, row: optimistic });
      try {
        await request();
        toast.success(successMessage);
        await queryClient.invalidateQueries({ queryKey });
      } catch (error) {
        toastRequestError(error);
      } finally {
        setBusyIds((ids) => new Set([...ids].filter((busy) => busy !== id)));
      }
    });
  };

  return { rows: optimisticRows, isBusy: (id: string) => busyIds.has(id), run };
}
