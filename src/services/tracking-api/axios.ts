import axios from 'axios';
import { ApiError } from '../../utils/api-error';

// The tracking engine runs apart from the datalab-api until it gets a route there; same error contract
export const trackingAxios = axios.create({
  baseURL: import.meta.env.VITE_TRACKING_API_URL,
  headers: { 'Content-Type': 'application/json' },
});

trackingAxios.interceptors.response.use(
  (response) => response,
  (error: unknown) => Promise.reject(ApiError.from(error)),
);
