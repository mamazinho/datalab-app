import { useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
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
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;
  const lastHandledTimestampRef = useRef(0);

  useEffect(() => {
    if (state.timestamp === 0 || state.timestamp === lastHandledTimestampRef.current) return;
    lastHandledTimestampRef.current = state.timestamp;

    const { onSuccess, successMessage, onError } = handlersRef.current;

    if (state.success) {
      if (successMessage) toast.success(successMessage);
      void onSuccess?.(state.data);
      return;
    }

    if (state.error) {
      if (onError) {
        onError(state.error);
      } else {
        toast.error(state.error);
      }
    }
  }, [state]);
}
