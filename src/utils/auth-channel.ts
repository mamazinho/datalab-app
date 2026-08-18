import { SOCIAL_AUTH_CHANNEL, type AuthChannelEvent } from '../types/auth';

/** Publica o resultado do callback para a aba que abriu o popup. */
export const postAuthChannelMessage = (message: AuthChannelEvent): void => {
  const channel = new BroadcastChannel(SOCIAL_AUTH_CHANNEL);
  channel.postMessage(message);
  channel.close();
};

/**
 * Fecha a janela do callback depois de publicar o resultado. `window.close()`
 * só funciona em janelas abertas por script — quando o callback cai na aba
 * principal (popup bloqueado, link colado à mão), executa o fallback.
 * Devolve o cleanup do timer para o useEffect que a chamou.
 */
export const closeCallbackWindow = (fallback: () => void, delayMs = 500): (() => void) => {
  const timeout = setTimeout(() => {
    window.close();
    if (!window.closed) fallback();
  }, delayMs);

  return () => clearTimeout(timeout);
};
