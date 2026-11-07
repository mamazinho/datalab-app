import axios, { type AxiosInstance, type AxiosResponse, type InternalAxiosRequestConfig } from "axios";
import type { UUID7 } from "../../types/ids";
import { ApiError } from "../../utils/api-error";

export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_DATALAB_API_URL,
  withCredentials: true,
  xsrfCookieName: 'csrftoken',
  xsrfHeaderName: 'X-CSRFToken',
  headers: {
    'Content-Type': 'application/json',
  },
});

let _currentCompanyId: UUID7 | null = null;

export function setCompanyId(id: UUID7 | null): void {
  _currentCompanyId = id;
}

export function getCompanyId(): UUID7 | null {
  return _currentCompanyId;
}

// Set by the AuthProvider so a dead session logs out through React instead of reloading the page
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

const REFRESHABLE_ERRORS = ['InvalidAccessTokenFriendlyException'];

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

// A streamed request (the chat) gets its error body as a stream too
async function toApiError(error: unknown): Promise<ApiError> {
  if (axios.isAxiosError(error) && error.response?.data instanceof ReadableStream) {
    const body = await new Response(error.response.data).text();
    try {
      error.response.data = JSON.parse(body);
    } catch {
      error.response.data = body;
    }
  }
  return ApiError.from(error);
}

const handlePublicAxiosError = async (error: unknown): Promise<never> => Promise.reject(await toApiError(error));

function createAuthenticatedErrorHandler(instance: AxiosInstance) {
  return async (error: unknown): Promise<unknown> => {
    const apiError = await toApiError(error);
    if (apiError.status !== 401 || !axios.isAxiosError(error)) return Promise.reject(apiError);

    const config = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;
    if (config && !config._retry && REFRESHABLE_ERRORS.includes(apiError.error)) {
      config._retry = true;
      try {
        const newToken = await refreshToken();
        config.headers['Authorization'] = `Bearer ${newToken}`;
        return instance(config);
      } catch {
        // refreshToken already ended the session
        return Promise.reject(apiError);
      }
    }

    // Ending the session here keeps the app from falling into /onboarding without user data
    endSession();
    return Promise.reject(apiError);
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
