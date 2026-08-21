import { AxiosError, AxiosHeaders } from 'axios';
import { describe, expect, it } from 'vitest';
import { MAX_QUERY_RETRIES, shouldRetryQuery } from './query-retry';

const axiosErrorWithStatus = (status: number): AxiosError => {
  const config = { headers: new AxiosHeaders() };
  return new AxiosError('falhou', 'ERR_BAD_RESPONSE', config, undefined, {
    status,
    statusText: '',
    data: {},
    headers: {},
    config,
  });
};

const networkError = (): AxiosError => new AxiosError('Network Error', 'ERR_NETWORK');

describe('shouldRetryQuery', () => {
  it('retries a network error (no response)', () => {
    expect(shouldRetryQuery(0, networkError())).toBe(true);
  });

  it('retries 5xx', () => {
    expect(shouldRetryQuery(0, axiosErrorWithStatus(500))).toBe(true);
    expect(shouldRetryQuery(3, axiosErrorWithStatus(503))).toBe(true);
  });

  it.each([400, 401, 403, 404, 422])('does not retry %i', (status) => {
    expect(shouldRetryQuery(0, axiosErrorWithStatus(status))).toBe(false);
  });

  it('stops once the retry limit is reached', () => {
    expect(shouldRetryQuery(MAX_QUERY_RETRIES - 1, axiosErrorWithStatus(500))).toBe(true);
    expect(shouldRetryQuery(MAX_QUERY_RETRIES, axiosErrorWithStatus(500))).toBe(false);
    expect(shouldRetryQuery(MAX_QUERY_RETRIES, networkError())).toBe(false);
  });

  it('conservatively retries a non-axios error', () => {
    expect(shouldRetryQuery(0, new Error('inesperado'))).toBe(true);
  });
});
