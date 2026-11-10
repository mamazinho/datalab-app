import axios, { AxiosError } from 'axios';
import type { IApiError } from '../types/errors';

export const TRACE_RESPONSE_HEADER = 'traceresponse';

const UNEXPECTED_MESSAGE = 'Ocorreu um erro inesperado. Tente novamente mais tarde.';
const NETWORK_MESSAGE = 'Não foi possível conectar ao servidor. Verifique sua internet.';
const TIMEOUT_MESSAGE = 'O servidor demorou demais para responder. Tente novamente.';

const STATUS_MESSAGES: Partial<Record<number, string>> = {
  429: 'Muitas requisições. Tente novamente em instantes.',
};

// A failure that never got an answer from the API, in the same contract the API answers with
export const clientError = (friendlyMessage: string, error = 'ClientError', status = 0): IApiError => ({
  error,
  status,
  message: friendlyMessage,
  friendly_message: friendlyMessage,
  detail: null,
});

// A proxy in front of the API may answer outside the contract, with HTML or plain text
const isApiError = (data: unknown): data is IApiError =>
  typeof data === 'object' && data !== null && typeof (data as IApiError).friendly_message === 'string';

const contractOf = ({ response, code }: AxiosError): IApiError => {
  if (response) {
    return isApiError(response.data)
      ? response.data
      : clientError(STATUS_MESSAGES[response.status] ?? UNEXPECTED_MESSAGE, 'HTTPError', response.status);
  }
  const timedOut = code === AxiosError.ECONNABORTED || code === AxiosError.ETIMEDOUT;
  return timedOut ? clientError(TIMEOUT_MESSAGE, 'TimeoutError') : clientError(NETWORK_MESSAGE, 'NetworkError');
};

// traceresponse follows the W3C traceparent format: version-traceid-spanid-flags
const traceIdOf = (error: AxiosError): string | undefined => {
  const traceresponse: unknown = error.response?.headers?.[TRACE_RESPONSE_HEADER];
  return typeof traceresponse === 'string' ? traceresponse.split('-')[1] : undefined;
};

export class ApiError extends Error implements IApiError {
  readonly error: string;
  readonly status: number;
  readonly friendly_message: string;
  readonly detail: unknown;
  readonly traceId?: string;

  constructor(contract: IApiError, traceId?: string) {
    super(contract.message);
    this.error = contract.error;
    this.status = contract.status;
    this.friendly_message = contract.friendly_message;
    this.detail = contract.detail;
    this.traceId = traceId;
  }

  static from(error: unknown): ApiError {
    if (error instanceof ApiError) return error;
    if (axios.isAxiosError(error)) return new ApiError(contractOf(error), traceIdOf(error));
    return new ApiError(clientError(error instanceof Error && error.message ? error.message : UNEXPECTED_MESSAGE));
  }
}
