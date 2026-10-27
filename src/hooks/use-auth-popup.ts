import { useCallback, useEffect, useRef, useState } from 'react';
import { SOCIAL_AUTH_CHANNEL, type AuthChannelEvent } from '../types/auth';

// Meta's consent lists portfolios, accounts and pages, so it needs a bigger window than login
const POPUP_SIZES = {
  login: { width: 500, height: 600 },
  consent: { width: 720, height: 780 },
} as const;

export type AuthPopupFlow = keyof typeof POPUP_SIZES;

const POPUP_WATCH_INTERVAL_MS = 500;

// A popup plus BroadcastChannel keeps the SPA state; the watcher unlocks the screen if the user closes the popup
export function useAuthPopup(onMessage: (event: AuthChannelEvent) => void) {
  const popupRef = useRef<Window | null>(null);
  const watcherRef = useRef<number | null>(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  // Keeps the latest handler without resubscribing to the channel on every render
  const onMessageRef = useRef(onMessage);
  onMessageRef.current = onMessage;

  const stopWatching = useCallback(() => {
    if (watcherRef.current !== null) {
      clearInterval(watcherRef.current);
      watcherRef.current = null;
    }
  }, []);

  const closePopup = useCallback(() => {
    popupRef.current?.close();
    popupRef.current = null;
    stopWatching();
    setIsPopupOpen(false);
  }, [stopWatching]);

  useEffect(() => {
    const authChannel = new BroadcastChannel(SOCIAL_AUTH_CHANNEL);

    authChannel.onmessage = (event: MessageEvent<AuthChannelEvent>) => {
      closePopup();
      onMessageRef.current(event.data);
    };

    return () => {
      authChannel.close();
    };
  }, [closePopup]);

  useEffect(() => stopWatching, [stopWatching]);

  const openPopup = useCallback(
    (url: string, name: string, flow: AuthPopupFlow = 'login'): Window | null => {
      const { width, height } = POPUP_SIZES[flow];
      const left = window.screenLeft + (window.innerWidth - width) / 2;
      const top = window.screenTop + (window.innerHeight - height) / 2;

      const popup = window.open(
        url,
        name,
        `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,status=yes,resizable=yes`,
      );

      stopWatching();
      popupRef.current = popup;
      setIsPopupOpen(Boolean(popup));

      if (popup) {
        watcherRef.current = window.setInterval(() => {
          if (popupRef.current?.closed !== false) closePopup();
        }, POPUP_WATCH_INTERVAL_MS);
      }

      return popup;
    },
    [closePopup, stopWatching],
  );

  return { openPopup, closePopup, isPopupOpen };
}
