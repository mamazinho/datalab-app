import axios from "axios";
import { PUBLIC_DATALAB_API_URL } from '$env/static/public';

export const axiosInstance = axios.create({
  baseURL: PUBLIC_DATALAB_API_URL,
  headers: {
    xsrfCookieName: 'csrftoken',
    xsrfHeaderName: 'X-CSRFToken',
    'Content-Type': 'application/json',
  },
});