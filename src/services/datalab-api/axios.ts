import axios from "axios";

export const axionsInstance = axios.create({
  baseURL: import.meta.env.VITE_DATALAB_API_URL,
  headers: {
    xsrfCookieName: 'csrftoken',
    xsrfHeaderName: 'X-CSRFToken',
    'Content-Type': 'application/json',
  },
});