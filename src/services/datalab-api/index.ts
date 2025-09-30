import axios from "axios";

export const datalabClient = (token?: string, contentType = 'application/json') => {
  return axios.create({
    baseURL: import.meta.env.VITE_DATALAB_API_URL,
    headers: {
      xsrfCookieName: 'csrftoken',
      xsrfHeaderName: 'X-CSRFToken',
      'Content-Type': contentType,
      Authorization: token ? `Bearer ${token}` : false,
    },
  });
};