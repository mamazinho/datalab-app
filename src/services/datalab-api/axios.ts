import axios, { type InternalAxiosRequestConfig } from "axios";

export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_DATALAB_API_URL,
  headers: {
    xsrfCookieName: 'csrftoken',
    xsrfHeaderName: 'X-CSRFToken',
    'Content-Type': 'application/json',
  },
});

// Slot para o ID da company selecionada — atualizado pelo CompanyProvider
let _currentCompanyId: number | null = null;

export function setCompanyId(id: number | null): void {
  _currentCompanyId = id;
}

export function getCompanyId(): number | null {
  return _currentCompanyId;
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
  console.log("Attaching company ID to request:", companyId, config.headers);
  if (companyId) {
    config.headers['X-Company-Id'] = String(companyId);
  }
  return config;
};

axiosPrivateInstance.interceptors.request.use(authInterceptor);
axiosCompanyInstance.interceptors.request.use(authInterceptor);
axiosCompanyInstance.interceptors.request.use(companyInterceptor);

const handleAxiosError = (error: Error) => {
  let message = "Ocorreu um erro inesperado. Tente novamente mais tarde.";

  if (axios.isAxiosError(error)) {
    if (error.response) {
      const data = error.response.data;

      if (data) {
        if (typeof data === 'string') {
          message = data;
        } else if (typeof data === 'object') {
          if (data.message) message = data.message;
          else if (data.error) message = data.error;
          else if (data.detail) message = data.detail;
        }
      }
    } else if (error.request) {
      message = "Não foi possível conectar ao servidor. Verifique sua internet.";
    } else {
      message = error.message;
    }
  }

  error.message = message;
  return Promise.reject(error);
};

axiosInstance.interceptors.response.use((response) => response, handleAxiosError);
axiosPrivateInstance.interceptors.response.use((response) => response, handleAxiosError);
axiosCompanyInstance.interceptors.response.use((response) => response, handleAxiosError);
