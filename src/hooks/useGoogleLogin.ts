import { useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../contexts/auth';
import { SOCIAL_AUTH_CHANNEL, type ISocialLoginCallbackEvent } from '../types/auth';

export function useGoogleLogin() {
  const { login } = useAuthContext();
  const navigate = useNavigate();
  const popupRef = useRef<Window | null>(null);

  const handleSocialLoginSuccessMessage = useCallback(async (event: MessageEvent<ISocialLoginCallbackEvent>) => {
    const validAuthEventTypes = ['GOOGLE_LOGIN_SUCCESS'];

    if (validAuthEventTypes.includes(event.data.type) && event.data.response.access_token) {
      await login(event.data.response);
      if (popupRef.current) {
        popupRef.current.close();
        popupRef.current = null;
      }
      navigate('/');
    }
  }, [login, navigate]);

  useEffect(() => {
    const authChannel = new BroadcastChannel(SOCIAL_AUTH_CHANNEL);
    authChannel.onmessage = handleSocialLoginSuccessMessage;

    return () => {
      authChannel.close();
    };
  }, [handleSocialLoginSuccessMessage]);

  const handleGoogleLogin = useCallback(() => {
    const datalabUrl = import.meta.env.VITE_DATALAB_API_URL;
    const googleAuthUrl = `${datalabUrl}/auth/google/login/`;

    const width = 500;
    const height = 600;
    const left = window.screenLeft + (window.innerWidth - width) / 2;
    const top = window.screenTop + (window.innerHeight - height) / 2;

    const popup = window.open(
      googleAuthUrl,
      'google_login_popup',
      `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,status=yes,resizable=yes`
    );
    popupRef.current = popup;
  }, []);

  return { handleGoogleLogin };
}
