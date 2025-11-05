
import { error } from '@sveltejs/kit';
import { isAxiosError } from 'axios';
import { browser } from '$app/environment';

export const callAndHandleError = async <T>(fn: () => Promise<T>) => {
  try {
    return await fn();
  } catch (e) {
    if (browser && isAxiosError(e) && e.response) {
      const statusToResponse = e.response.status || 500;
      console.log(e.response.data.detail)
      const fullErrorMsg = `${e.response.status} - ${e.response.statusText} (${e.message}): ${e.response.data.detail}`;
      error(statusToResponse, fullErrorMsg);
    }
    throw e;
  }
}