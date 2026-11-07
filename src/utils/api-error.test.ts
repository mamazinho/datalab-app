import { AxiosError, AxiosHeaders, type InternalAxiosRequestConfig } from 'axios';
import { describe, expect, it } from 'vitest';
import { buildApiError } from '../test/factories';
import { ApiError } from './api-error';

const TRACERESPONSE = '00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01';

const failedRequest = (status: number, data: unknown, headers: Record<string, string> = {}): AxiosError => {
  const config = { headers: new AxiosHeaders() } as InternalAxiosRequestConfig;
  return new AxiosError('Request failed', 'ERR_BAD_REQUEST', config, undefined, {
    data,
    status,
    statusText: '',
    headers,
    config,
  });
};

describe('ApiError.from', () => {
  it('keeps the contract the API answered with', () => {
    const contract = buildApiError({ status: 409, friendly_message: 'Já existe um agente com esse nome.' });

    const error = ApiError.from(failedRequest(409, contract));

    expect(error).toMatchObject(contract);
  });

  it('reads the trace id out of the traceresponse header', () => {
    const error = ApiError.from(failedRequest(500, buildApiError(), { traceresponse: TRACERESPONSE }));

    expect(error.traceId).toBe('4bf92f3577b34da6a3ce929d0e0e4736');
  });

  it('has no trace id when the response did not send one', () => {
    expect(ApiError.from(failedRequest(500, buildApiError())).traceId).toBeUndefined();
  });

  it('puts a body outside the contract into the contract', () => {
    const error = ApiError.from(failedRequest(502, '<html>Bad Gateway</html>'));

    expect(error).toMatchObject({
      error: 'HTTPError',
      status: 502,
      friendly_message: 'Ocorreu um erro inesperado. Tente novamente mais tarde.',
    });
  });

  it('keeps the message of an error the app raised itself', () => {
    expect(ApiError.from(new Error('Falha no upload da imagem.')).friendly_message).toBe('Falha no upload da imagem.');
  });

  it('hands back an error that already speaks the contract', () => {
    const error = new ApiError(buildApiError());

    expect(ApiError.from(error)).toBe(error);
  });
});
