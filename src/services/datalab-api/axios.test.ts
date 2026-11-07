import { AxiosError, type AxiosAdapter, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { buildApiError } from '../../test/factories';
import { axiosInstance, axiosCompanyInstance, axiosPrivateInstance, setSessionExpiredHandler } from './axios';

const NEW_TOKEN = 'token-novo';

const okResponse = (config: InternalAxiosRequestConfig, data: unknown): AxiosResponse => ({
  data,
  status: 200,
  statusText: 'OK',
  headers: {},
  config,
});

const unauthorized = (
  config: InternalAxiosRequestConfig,
  error: string,
  friendlyMessage = 'Sua sessão expirou. Entre novamente.',
): AxiosError =>
  new AxiosError('Request failed with status code 401', 'ERR_BAD_REQUEST', config, undefined, {
    data: buildApiError({ status: 401, error, friendly_message: friendlyMessage }),
    status: 401,
    statusText: 'Unauthorized',
    headers: {},
    config,
  });

const authorizationOf = (config: InternalAxiosRequestConfig): string =>
  String(config.headers.get('Authorization') ?? '');

const buildPrivateAdapter = (error = 'InvalidAccessTokenFriendlyException', friendlyMessage?: string) =>
  vi.fn<AxiosAdapter>(async (config) => {
    if (authorizationOf(config) === `Bearer ${NEW_TOKEN}`) {
      return okResponse(config, { ok: true });
    }
    throw unauthorized(config, error, friendlyMessage);
  });

const buildRefreshAdapter = () =>
  vi.fn<AxiosAdapter>(async (config) => okResponse(config, { access_token: NEW_TOKEN }));

const defaultAdapters = {
  public: axiosInstance.defaults.adapter,
  private: axiosPrivateInstance.defaults.adapter,
};

afterEach(() => {
  axiosInstance.defaults.adapter = defaultAdapters.public;
  axiosPrivateInstance.defaults.adapter = defaultAdapters.private;
  setSessionExpiredHandler(null);
});

describe('instance configuration', () => {
  it('sends credentials and keeps the CSRF options at the right config level', () => {
    expect(axiosInstance.defaults.withCredentials).toBe(true);
    expect(axiosInstance.defaults.xsrfCookieName).toBe('csrftoken');
    expect(axiosInstance.defaults.xsrfHeaderName).toBe('X-CSRFToken');
  });

  it('propagates the configuration to the authenticated instances', () => {
    [axiosPrivateInstance, axiosCompanyInstance].forEach((instance) => {
      expect(instance.defaults.withCredentials).toBe(true);
      expect(instance.defaults.xsrfCookieName).toBe('csrftoken');
    });
  });
});

describe('auth interceptor', () => {
  it('injects the access token from localStorage', async () => {
    localStorage.setItem('accessToken', NEW_TOKEN);
    const adapter = buildPrivateAdapter();
    axiosPrivateInstance.defaults.adapter = adapter;

    await axiosPrivateInstance.get('me/');

    expect(authorizationOf(adapter.mock.calls[0][0])).toBe(`Bearer ${NEW_TOKEN}`);
  });
});

describe('silent refresh on 401', () => {
  it('renews the token and replays the original request', async () => {
    localStorage.setItem('accessToken', 'token-velho');
    const privateAdapter = buildPrivateAdapter();
    const refreshAdapter = buildRefreshAdapter();
    axiosPrivateInstance.defaults.adapter = privateAdapter;
    axiosInstance.defaults.adapter = refreshAdapter;

    const response = await axiosPrivateInstance.get('me/');

    expect(refreshAdapter.mock.calls[0][0].url).toBe('auth/refresh/');
    expect(localStorage.getItem('accessToken')).toBe(NEW_TOKEN);
    expect(privateAdapter).toHaveBeenCalledTimes(2);
    expect(authorizationOf(privateAdapter.mock.calls[1][0])).toBe(`Bearer ${NEW_TOKEN}`);
    expect(response.data).toEqual({ ok: true });
  });

  it('refreshes only once for concurrent requests', async () => {
    localStorage.setItem('accessToken', 'token-velho');
    const refreshAdapter = buildRefreshAdapter();
    axiosPrivateInstance.defaults.adapter = buildPrivateAdapter();
    axiosInstance.defaults.adapter = refreshAdapter;

    await Promise.all([
      axiosPrivateInstance.get('me/'),
      axiosPrivateInstance.get('chats/'),
      axiosPrivateInstance.get('agents/'),
    ]);

    expect(refreshAdapter).toHaveBeenCalledOnce();
  });

  it('never retries the same request more than once', async () => {
    const privateAdapter = vi.fn<AxiosAdapter>(async (config) => {
      throw unauthorized(config, 'InvalidAccessTokenFriendlyException');
    });
    axiosPrivateInstance.defaults.adapter = privateAdapter;
    axiosInstance.defaults.adapter = buildRefreshAdapter();
    setSessionExpiredHandler(vi.fn());

    await expect(axiosPrivateInstance.get('me/')).rejects.toThrow();

    expect(privateAdapter).toHaveBeenCalledTimes(2);
  });

  it('ends the session when the refresh itself fails', async () => {
    const onSessionExpired = vi.fn();
    setSessionExpiredHandler(onSessionExpired);
    axiosPrivateInstance.defaults.adapter = buildPrivateAdapter();
    axiosInstance.defaults.adapter = vi.fn<AxiosAdapter>(async (config) => {
      throw unauthorized(config, 'SessionExpiredFriendlyException');
    });

    await expect(axiosPrivateInstance.get('me/')).rejects.toThrow();

    expect(onSessionExpired).toHaveBeenCalledOnce();
  });

  it('ends the session straight away on a 401 that is not an expired token', async () => {
    const onSessionExpired = vi.fn();
    setSessionExpiredHandler(onSessionExpired);
    const refreshAdapter = buildRefreshAdapter();
    axiosPrivateInstance.defaults.adapter = buildPrivateAdapter('InactiveUserFriendlyException', 'Esta conta não está ativa.');
    axiosInstance.defaults.adapter = refreshAdapter;

    await expect(axiosPrivateInstance.get('me/')).rejects.toMatchObject({ friendly_message: 'Esta conta não está ativa.' });

    expect(refreshAdapter).not.toHaveBeenCalled();
    expect(onSessionExpired).toHaveBeenCalledOnce();
  });
});

describe('public instance error handling', () => {
  it('uses the friendly message of the backend as the error message', async () => {
    axiosInstance.defaults.adapter = vi.fn<AxiosAdapter>(async (config) => {
      throw new AxiosError('Request failed', 'ERR_BAD_REQUEST', config, undefined, {
        data: buildApiError({ friendly_message: 'E-mail ou senha inválidos.' }),
        status: 400,
        statusText: 'Bad Request',
        headers: {},
        config,
      });
    });

    await expect(axiosInstance.post('auth/login/')).rejects.toMatchObject({ friendly_message: 'E-mail ou senha inválidos.' });
  });

  it('translates a network failure into a readable message', async () => {
    axiosInstance.defaults.adapter = vi.fn<AxiosAdapter>(async (config) => {
      throw new AxiosError('Network Error', 'ERR_NETWORK', config, {});
    });

    await expect(axiosInstance.get('health/')).rejects.toMatchObject({ friendly_message: expect.stringMatching(/Verifique sua internet/) });
  });

  it('tells a timeout apart from a network failure', async () => {
    axiosInstance.defaults.adapter = vi.fn<AxiosAdapter>(async (config) => {
      throw new AxiosError('timeout of 30000ms exceeded', 'ECONNABORTED', config, {});
    });

    await expect(axiosInstance.get('health/')).rejects.toMatchObject({ friendly_message: expect.stringMatching(/demorou demais para responder/) });
  });
});

describe('authenticated instance error handling', () => {
  it('tells a timeout apart from a network failure', async () => {
    axiosPrivateInstance.defaults.adapter = vi.fn<AxiosAdapter>(async (config) => {
      throw new AxiosError('timeout of 30000ms exceeded', 'ECONNABORTED', config, {});
    });

    await expect(axiosPrivateInstance.get('me/')).rejects.toMatchObject({ friendly_message: expect.stringMatching(/demorou demais para responder/) });
  });

  it('translates a network failure into a readable message', async () => {
    axiosPrivateInstance.defaults.adapter = vi.fn<AxiosAdapter>(async (config) => {
      throw new AxiosError('Network Error', 'ERR_NETWORK', config, {});
    });

    await expect(axiosPrivateInstance.get('me/')).rejects.toMatchObject({ friendly_message: expect.stringMatching(/Verifique sua internet/) });
  });
});

const failWith = (status: number, data: unknown) =>
  vi.fn<AxiosAdapter>(async (config) => {
    throw new AxiosError(`Request failed with status code ${status}`, 'ERR_BAD_REQUEST', config, undefined, {
      data,
      status,
      statusText: '',
      headers: {},
      config,
    });
  });

describe.each([
  ['public', axiosInstance],
  ['authenticated', axiosPrivateInstance],
])('%s instance error message', (_, instance) => {
  it('shows the friendly message even on a server error', async () => {
    instance.defaults.adapter = failWith(
      500,
      buildApiError({ status: 500, error: 'InternalServerErrorFriendlyException', friendly_message: 'Algo deu errado.' }),
    );

    await expect(instance.get('agents/')).rejects.toMatchObject({ friendly_message: expect.stringMatching(/^Algo deu errado\.$/) });
  });

  it('prefers the friendly message of the backend over the generic rate limit text', async () => {
    instance.defaults.adapter = failWith(429, buildApiError({ status: 429, friendly_message: 'Peça um novo código.' }));

    await expect(instance.get('agents/')).rejects.toMatchObject({ friendly_message: expect.stringMatching(/^Peça um novo código\.$/) });
  });

  it('explains a rate limit that comes from outside the API in plain words', async () => {
    instance.defaults.adapter = failWith(429, '<html>Too Many Requests</html>');

    await expect(instance.get('agents/')).rejects.toMatchObject({ friendly_message: expect.stringMatching(/^Muitas requisições\. Tente novamente em instantes\.$/) });
  });

  it('explains a body outside the contract in plain words', async () => {
    instance.defaults.adapter = failWith(502, '<html>Bad Gateway</html>');

    await expect(instance.get('agents/')).rejects.toMatchObject({ friendly_message: expect.stringMatching(/^Ocorreu um erro inesperado\. Tente novamente mais tarde\.$/) });
  });
});
