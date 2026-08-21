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

/** Adapter da instância autenticada: só responde 200 para o token novo. */
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

describe('configuração das instâncias', () => {
  // O cookie httpOnly refresh_token só viaja em requisição cross-origin com
  // withCredentials — sem isso o refresh silencioso desloga todo mundo.
  it('envia credenciais e usa as opções de CSRF no nível certo da config', () => {
    expect(axiosInstance.defaults.withCredentials).toBe(true);
    expect(axiosInstance.defaults.xsrfCookieName).toBe('csrftoken');
    expect(axiosInstance.defaults.xsrfHeaderName).toBe('X-CSRFToken');
  });

  it('propaga a configuração para as instâncias autenticadas', () => {
    [axiosPrivateInstance, axiosCompanyInstance].forEach((instance) => {
      expect(instance.defaults.withCredentials).toBe(true);
      expect(instance.defaults.xsrfCookieName).toBe('csrftoken');
    });
  });
});

describe('interceptor de autenticação', () => {
  it('injeta o access token do localStorage', async () => {
    localStorage.setItem('accessToken', NEW_TOKEN);
    const adapter = buildPrivateAdapter();
    axiosPrivateInstance.defaults.adapter = adapter;

    await axiosPrivateInstance.get('me/');

    expect(authorizationOf(adapter.mock.calls[0][0])).toBe(`Bearer ${NEW_TOKEN}`);
  });
});

describe('refresh silencioso no 401', () => {
  it('renova o token e repete a requisição original', async () => {
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

  it('faz um único refresh para várias requisições simultâneas', async () => {
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

  it('não tenta refresh mais de uma vez para a mesma requisição', async () => {
    const privateAdapter = vi.fn<AxiosAdapter>(async (config) => {
      throw unauthorized(config, 'Token has expired');
    });
    axiosPrivateInstance.defaults.adapter = privateAdapter;
    axiosInstance.defaults.adapter = buildRefreshAdapter();
    setSessionExpiredHandler(vi.fn());

    await expect(axiosPrivateInstance.get('me/')).rejects.toThrow();

    expect(privateAdapter).toHaveBeenCalledTimes(2);
  });

  it('encerra a sessão quando o refresh falha', async () => {
    const onSessionExpired = vi.fn();
    setSessionExpiredHandler(onSessionExpired);
    axiosPrivateInstance.defaults.adapter = buildPrivateAdapter();
    axiosInstance.defaults.adapter = vi.fn<AxiosAdapter>(async (config) => {
      throw unauthorized(config, 'Invalid token');
    });

    await expect(axiosPrivateInstance.get('me/')).rejects.toThrow();

    expect(onSessionExpired).toHaveBeenCalledOnce();
  });

  it('encerra a sessão direto em 401 que não é de token expirado', async () => {
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

describe('tratamento de erro da instância pública', () => {
  it('usa o detail do backend como mensagem', async () => {
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

  it('traduz falha de rede para uma mensagem legível', async () => {
    axiosInstance.defaults.adapter = vi.fn<AxiosAdapter>(async (config) => {
      throw new AxiosError('Network Error', 'ERR_NETWORK', config, {});
    });

    await expect(axiosInstance.get('health/')).rejects.toThrow(/Verifique sua internet/);
  });
});
