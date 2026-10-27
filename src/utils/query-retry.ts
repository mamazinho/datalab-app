import axios from 'axios';

export const MAX_QUERY_RETRIES = 5;

export const QUERY_RETRY_DELAY_MS = 3000;

// Only transient errors (5xx or network) are retried; a 4xx never fixes itself
export const shouldRetryQuery = (failureCount: number, error: unknown): boolean => {
  if (failureCount >= MAX_QUERY_RETRIES) return false;

  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    if (status === undefined) return true; // sem response = rede/servidor inacessível
    return status >= 500;
  }

  return true; // erro não-axios (inesperado): retenta de forma conservadora
};
