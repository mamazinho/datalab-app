import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../contexts/auth';
import { useAuthPopup } from './use-auth-popup';
import { DatalabAPI } from '../services/datalab-api';
import { SOCIAL_LOGIN_SUCCESS } from '../types/auth';
import type { Provider } from '../types/integrations';

/**
 * Login social (Google/Meta) na janela separada do `useAuthPopup`. O fluxo é
 * idêntico nos dois providers — só o path muda.
 */
export function useSocialLogin() {
  const { login } = useAuthContext();
  const navigate = useNavigate();

  const { openPopup } = useAuthPopup(async (event) => {
    if (event.type !== SOCIAL_LOGIN_SUCCESS || !event.response?.access_token) return;

    await login(event.response);
    navigate('/');
  });

  const handleSocialLogin = useCallback(
    (provider: Provider) => {
      openPopup(DatalabAPI.AuthResource.socialLoginUrl(provider), `${provider}_login_popup`);
    },
    [openPopup],
  );

  return { handleSocialLogin };
}
