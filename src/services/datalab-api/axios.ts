import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_DATALAB_API_URL,
  headers: {
    xsrfCookieName: 'csrftoken',
    xsrfHeaderName: 'X-CSRFToken',
    'Content-Type': 'application/json',
  },
});

export const axiosPrivateInstance = axios.create({ ...axiosInstance.defaults });


axiosPrivateInstance.interceptors.request.use(config => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

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
