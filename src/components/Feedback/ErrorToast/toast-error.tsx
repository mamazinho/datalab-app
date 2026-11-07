import { toast, type ToastOptions } from 'react-toastify';
import { ApiError } from '../../../utils/api-error';
import { ErrorToast } from './error-toast';

export const toastError = (message: string, traceId?: string, options?: ToastOptions) =>
  toast.error(<ErrorToast message={message} traceId={traceId} />, options);

export const toastRequestError = (error: unknown) => {
  const { friendly_message, traceId } = ApiError.from(error);
  return toastError(friendly_message, traceId);
};
