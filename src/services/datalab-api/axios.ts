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
