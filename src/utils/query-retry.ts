import axios from 'axios';

/** Máximo de novas tentativas para queries que falham por erro transitório. */
export const MAX_QUERY_RETRIES = 10;

/** Intervalo fixo entre tentativas (ms). */
export const QUERY_RETRY_DELAY_MS = 3000;

/**
 * Só vale retentar erros transitórios: 5xx (problema momentâneo do servidor) ou
 * falha de rede (servidor inacessível). Erros 4xx (401/403/404, validação) não se
 * resolvem sozinhos com o tempo — não retenta. Evita martelar o backend quando ele
 * está fora do ar: espaça as tentativas em QUERY_RETRY_DELAY_MS e limita a MAX_QUERY_RETRIES.
 */
export const shouldRetryQuery = (failureCount: number, error: unknown): boolean => {
  if (failureCount >= MAX_QUERY_RETRIES) return false;

  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    if (status === undefined) return true; // sem response = rede/servidor inacessível
    return status >= 500;
  }

  return true; // erro não-axios (inesperado): retenta de forma conservadora
};
