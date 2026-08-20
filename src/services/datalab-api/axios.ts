import axios, { type AxiosInstance, type AxiosResponse, type InternalAxiosRequestConfig } from "axios";
import type { UUID } from "../../types/ids";

export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_DATALAB_API_URL,
  withCredentials: true,
  xsrfCookieName: 'csrftoken',
  xsrfHeaderName: 'X-CSRFToken',
  headers: {
    'Content-Type': 'application/json',
  },
});

let _currentCompanyId: UUID | null = null;

export function setCompanyId(id: UUID | null): void {
  _currentCompanyId = id;
}

export function getCompanyId(): UUID | null {
  return _currentCompanyId;
}

// ── Fim de sessão ────────────────────────────────────────────────────────────
// O AuthProvider registra um handler (logout via React) para encerrar a sessão
// sem recarregar a página. Enquanto não houver handler, usa o fallback de reload.
let _onSessionExpired: (() => void) | null = null;

export function setSessionExpiredHandler(handler: (() => void) | null): void {
  _onSessionExpired = handler;
}

function endSession(): void {
  if (_onSessionExpired) {
    _onSessionExpired();
    return;
  }
  localStorage.clear();
  document.cookie = 'csrftoken=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
  window.location.href = '/login';
}

const refreshableErrors = ['Token has expired', 'Invalid token'];

let _isRefreshing = false;
let _refreshQueue: Array<{ resolve: (token: string) => void; reject: (err: unknown) => void }> = [];

async function doRefresh(): Promise<string> {
  const { data } = await axiosInstance.post<{ access_token: string }>('auth/refresh/');
  localStorage.setItem('accessToken', data.access_token);
  return data.access_token;
}

function refreshToken(): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    _refreshQueue.push({ resolve, reject });

    if (_isRefreshing) return;

    _isRefreshing = true;
    doRefresh()
      .then((token) => _refreshQueue.forEach((q) => q.resolve(token)))
      .catch((err) => {
        _refreshQueue.forEach((q) => q.reject(err));
        endSession();
      })
      .finally(() => {
        _refreshQueue = [];
        _isRefreshing = false;
      });
  });
}

export const axiosPrivateInstance = axios.create({ ...axiosInstance.defaults });
export const axiosCompanyInstance = axios.create({ ...axiosPrivateInstance.defaults });

const authInterceptor = (config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
};

const companyInterceptor = (config: InternalAxiosRequestConfig) => {
  const companyId = getCompanyId();
  if (companyId) {
    config.headers['X-Company-Id'] = String(companyId);
  }
  return config;
};

type RequestInterceptor = (config: InternalAxiosRequestConfig) => InternalAxiosRequestConfig;

function registerRequestInterceptors(instance: AxiosInstance, interceptors: RequestInterceptor[]): void {
  interceptors.forEach((interceptor) => {
    instance.interceptors.request.use(interceptor);
  });
}

registerRequestInterceptors(axiosPrivateInstance, [authInterceptor]);
registerRequestInterceptors(axiosCompanyInstance, [authInterceptor, companyInterceptor]);

function extractErrorMessage(data: unknown): string {
  const detail = (data as Record<string, unknown>)?.detail;
  return typeof detail === 'string' ? detail : '';
}

const handlePublicAxiosError = (error: Error): Promise<never> => {
  if (axios.isAxiosError(error)) {
    if (error.response) {
      const msg = extractErrorMessage(error.response.data);
      if (msg) error.message = msg;
    } else if (error.request) {
      error.message = 'Não foi possível conectar ao servidor. Verifique sua internet.';
    }
  } else {
    error.message = 'Ocorreu um erro inesperado. Tente novamente mais tarde.';
  }
  return Promise.reject(error);
};

function createAuthenticatedErrorHandler(instance: AxiosInstance) {
  return async (error: Error): Promise<unknown> => {
    if (!axios.isAxiosError(error)) return Promise.reject(error);

    if (!error.response) {
      if (error.request) error.message = 'Não foi possível conectar ao servidor. Verifique sua internet.';
      return Promise.reject(error);
    }

    const message = extractErrorMessage(error.response.data);

    if (error.response.status === 401) {
      const config = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;

      // Tenta um refresh silencioso uma única vez para 401 recuperáveis
      if (config && !config._retry && refreshableErrors.some((msg) => message.includes(msg))) {
        config._retry = true;
        try {
          const newToken = await refreshToken();
          config.headers['Authorization'] = `Bearer ${newToken}`;
          return instance(config);
        } catch {
          // refreshToken já encerra a sessão no seu catch
          return Promise.reject(error);
        }
      }

      // Qualquer outro 401 = sessão inválida/expirada → encerra e volta ao login
      // (em vez de deixar o app cair em /onboarding por falta de dados do usuário)
      endSession();
      if (message) error.message = message;
      return Promise.reject(error);
    }

    if (message) error.message = message;
    return Promise.reject(error);
  };
}

type ResponseInterceptor = {
  onFulfilled?: (response: AxiosResponse) => AxiosResponse | Promise<AxiosResponse>;
  onRejected: (error: Error) => unknown;
};

function registerResponseInterceptors(instance: AxiosInstance, interceptors: ResponseInterceptor[]): void {
  interceptors.forEach(({ onFulfilled, onRejected }) => {
    instance.interceptors.response.use(onFulfilled ?? ((r) => r), onRejected);
  });
}

registerResponseInterceptors(axiosInstance, [
  { onRejected: handlePublicAxiosError },
]);

registerResponseInterceptors(axiosPrivateInstance, [
  { onRejected: createAuthenticatedErrorHandler(axiosPrivateInstance) },
]);

registerResponseInterceptors(axiosCompanyInstance, [
  { onRejected: createAuthenticatedErrorHandler(axiosCompanyInstance) },
]);
