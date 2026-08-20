import { useCallback, useEffect, useRef, useState } from 'react';
import { SOCIAL_AUTH_CHANNEL, type AuthChannelEvent } from '../types/auth';

// O consentimento do Meta lista portfólios, contas e páginas; a tela de login é compacta.
const POPUP_SIZES = {
  login: { width: 500, height: 600 },
  consent: { width: 720, height: 780 },
} as const;

export type AuthPopupFlow = keyof typeof POPUP_SIZES;

const POPUP_WATCH_INTERVAL_MS = 500;

/**
 * Janela separada + BroadcastChannel: é assim que o app fala com Google e Meta,
 * tanto no login quanto ao conectar uma integração. A aba original nunca navega
 * para fora, então nada de estado da SPA se perde no caminho.
 *
 * Ao receber o resultado a janela é fechada e `onMessage` é chamado. Um watcher
 * acompanha o fechamento manual do popup — sem ele, desistir no meio deixaria a
 * tela travada em "conectando".
 */
export function useAuthPopup(onMessage: (event: AuthChannelEvent) => void) {
  const popupRef = useRef<Window | null>(null);
  const watcherRef = useRef<number | null>(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  // Handler sempre atualizado sem reassinar o canal a cada render
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
