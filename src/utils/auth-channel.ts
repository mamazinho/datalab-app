import { SOCIAL_AUTH_CHANNEL, type AuthChannelEvent } from '../types/auth';

export const postAuthChannelMessage = (message: AuthChannelEvent): void => {
  const channel = new BroadcastChannel(SOCIAL_AUTH_CHANNEL);
  channel.postMessage(message);
  channel.close();
};

// window.close() only works on script-opened windows; otherwise the fallback runs
export const closeCallbackWindow = (fallback: () => void, delayMs = 500): (() => void) => {
  const timeout = setTimeout(() => {
    window.close();
    if (!window.closed) fallback();
  }, delayMs);

  return () => clearTimeout(timeout);
};
