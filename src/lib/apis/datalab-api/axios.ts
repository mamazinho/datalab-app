import axios from "axios";
import { PUBLIC_DATALAB_API_URL } from '$env/static/public';
import { auth } from "$home/lib/states/auth.svelte";
import { redirect } from "@sveltejs/kit";

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
  const token = auth.accessToken;
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

axiosPrivateInstance.interceptors.response.use(response => response, async (error) => {
  if (error.response?.status === 401) {
    if (error.config._retry) {
      return Promise.reject(error);
    }
    console.log('[AXIOS] 401 detected');
    const ok = await auth.ensureSession();
    if (ok) {
      // Retry the original request
      error.config.headers['Authorization'] = `Bearer ${auth.accessToken}`;
      error.config._retry = true;
      return await axiosPrivateInstance.request(error.config);
    }
    await auth.logout();
    throw redirect(302, '/login');
  }

  return Promise.reject(error);
});