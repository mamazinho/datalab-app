import axios from "axios";
import { PUBLIC_DATALAB_API_URL } from '$env/static/public';
import { AuthService } from "$home/lib/auth/service";

export const axiosInstance = axios.create({
  baseURL: PUBLIC_DATALAB_API_URL,
  headers: {
    xsrfCookieName: 'csrftoken',
    xsrfHeaderName: 'X-CSRFToken',
    'Content-Type': 'application/json',
  },
});


export const axiosPrivateInstance = axios.create({ ...axiosInstance.defaults });


axiosPrivateInstance.interceptors.request.use(config => {
  const token = new AuthService().getAccessTokenSync();
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});