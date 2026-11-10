import { useEffect, useEffectEvent, useRef } from 'react';
import { toast } from 'react-toastify';
import { toastError } from '../components/Feedback/ErrorToast';
import type { ActionState } from '../types/actions';

interface IActionFeedbackHandlers<T> {
  onSuccess?: (data?: T) => void | Promise<void>;
  successMessage?: string;
  onError?: (error: string) => void;
}

export function useActionFeedback<T>(
  state: ActionState<T>,
  handlers: IActionFeedbackHandlers<T>,
): void {
  const lastHandledTimestampRef = useRef(0);

  const handle = useEffectEvent((result: ActionState<T>) => {
    const { onSuccess, successMessage, onError } = handlers;

    if (result.success) {
      if (successMessage) toast.success(successMessage);
      void onSuccess?.(result.data);
      return;
    }

    if (result.error) {
      if (onError) {
        onError(result.error);
      } else {
        toastError(result.error, result.traceId);
      }
    }
  });

  useEffect(() => {
    if (state.timestamp === 0 || state.timestamp === lastHandledTimestampRef.current) return;
    lastHandledTimestampRef.current = state.timestamp;
    handle(state);
  }, [state]);
}
