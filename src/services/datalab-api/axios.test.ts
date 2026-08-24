import { AxiosError, type AxiosAdapter, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { axiosInstance, axiosCompanyInstance, axiosPrivateInstance, setSessionExpiredHandler } from './axios';

const NEW_TOKEN = 'token-novo';

const okResponse = (config: InternalAxiosRequestConfig, data: unknown): AxiosResponse => ({
  data,
  status: 200,
  statusText: 'OK',
  headers: {},
  config,
});

const unauthorized = (config: InternalAxiosRequestConfig, detail: string): AxiosError =>
  new AxiosError('Request failed with status code 401', 'ERR_BAD_REQUEST', config, undefined, {
    data: { detail },
    status: 401,
    statusText: 'Unauthorized',
    headers: {},
    config,
  });

const authorizationOf = (config: InternalAxiosRequestConfig): string =>
  String(config.headers.get('Authorization') ?? '');

const buildPrivateAdapter = (detail = 'Token has expired') =>
  vi.fn<AxiosAdapter>(async (config) => {
    if (authorizationOf(config) === `Bearer ${NEW_TOKEN}`) {
      return okResponse(config, { ok: true });
    }
    throw unauthorized(config, detail);
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
      throw unauthorized(config, 'Token has expired');
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
      throw unauthorized(config, 'Invalid token');
    });

    await expect(axiosPrivateInstance.get('me/')).rejects.toThrow();

    expect(onSessionExpired).toHaveBeenCalledOnce();
  });

  it('ends the session straight away on a 401 that is not an expired token', async () => {
    const onSessionExpired = vi.fn();
    setSessionExpiredHandler(onSessionExpired);
    const refreshAdapter = buildRefreshAdapter();
    axiosPrivateInstance.defaults.adapter = buildPrivateAdapter('Not authenticated');
    axiosInstance.defaults.adapter = refreshAdapter;

    await expect(axiosPrivateInstance.get('me/')).rejects.toThrow('Not authenticated');

    expect(refreshAdapter).not.toHaveBeenCalled();
    expect(onSessionExpired).toHaveBeenCalledOnce();
  });
});

describe('public instance error handling', () => {
  it('uses the backend detail as the error message', async () => {
    axiosInstance.defaults.adapter = vi.fn<AxiosAdapter>(async (config) => {
      throw new AxiosError('Request failed', 'ERR_BAD_REQUEST', config, undefined, {
        data: { detail: 'E-mail ou senha inválidos.' },
        status: 400,
        statusText: 'Bad Request',
        headers: {},
        config,
      });
    });

    await expect(axiosInstance.post('auth/login/')).rejects.toThrow('E-mail ou senha inválidos.');
  });

  it('translates a network failure into a readable message', async () => {
    axiosInstance.defaults.adapter = vi.fn<AxiosAdapter>(async (config) => {
      throw new AxiosError('Network Error', 'ERR_NETWORK', config, {});
    });

    await expect(axiosInstance.get('health/')).rejects.toThrow(/Verifique sua internet/);
  });
});
