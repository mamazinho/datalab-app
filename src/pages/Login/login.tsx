import React, { useEffect, useRef, useActionState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LoginContainer } from './login.style';
import { useAuthContext } from '../../contexts/auth';
import { toast } from 'react-toastify';
import { GoogleButton } from '../../components/UI/Buttons/google-button';
import { loginAction } from './actions';
import { SOCIAL_AUTH_CHANNEL, type ISocialLoginCallbackEvent } from '../../types/auth';
import type { ILoginUserResponse } from '../../services/datalab-api/authResource';
import { INITIAL_ACTION_STATE, type ActionState } from '../../types/actions';
import { PasswordInput } from '../../components/UI/Inputs/password-input';

export const Login: React.FC = () => {
  const [loginState, loginFormAction, isLoginPending] = useActionState(loginAction, INITIAL_ACTION_STATE);
  const { login } = useAuthContext();
  const navigate = useNavigate();
  const popupRef = useRef<Window | null>(null);

  const handleLoginActionResult = useCallback((formState: ActionState<ILoginUserResponse>) => {
    if (formState.timestamp === 0) return;
    if (formState.success && formState.data) {
      login(formState.data);
      navigate('/');
    } else if (formState.error) {
      toast.error(formState.error);
    }
  }, [login, navigate]);

  const handleSocialLoginSuccessMessage = useCallback((event: MessageEvent<ISocialLoginCallbackEvent>) => {
    const validAuthEventTypes = ['GOOGLE_LOGIN_SUCCESS'];

    if (validAuthEventTypes.includes(event.data.type) && event.data.response.access_token) {
      login(event.data.response);
      if (popupRef.current) {
        popupRef.current.close();
        popupRef.current = null;
      }
      navigate('/');
    }
  }, [login, navigate]);

  const handleGoogleLogin = () => {
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
  };

  // Form submission result effect
  useEffect(() => {
    handleLoginActionResult(loginState);
  }, [loginState, handleLoginActionResult]);

  // Google login popup message effect
  useEffect(() => {
    const authChannel = new BroadcastChannel(SOCIAL_AUTH_CHANNEL);
    authChannel.onmessage = handleSocialLoginSuccessMessage;

    return () => {
      authChannel.close();
    };
  }, [handleSocialLoginSuccessMessage]);

  return (
    <LoginContainer>
      <div className="flex items-center justify-center min-h-[80vh] p-4">
        <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold text-gray-800 mb-2">DataLab <span className="text-orange-600">App</span></h1>
            <h2 className="text-gray-500 text-lg font-medium">Benvindo de volta!</h2>
          </div>

          <form action={loginFormAction} className="space-y-5">
            <fieldset disabled={isLoginPending} className="space-y-5">
              <div className="space-y-1">
                <label htmlFor="inputEmail" className="block text-sm font-semibold text-gray-700 ml-1">Email</label>
                <input
                  type="email"
                  id="inputEmail"
                  name="email"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all bg-gray-50 focus:bg-white disabled:bg-gray-100 disabled:text-gray-500"
                  placeholder="seu@email.com"
                  required
                  autoFocus
                  autoComplete="email"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="inputPassword" className="block text-sm font-semibold text-gray-700 ml-1">Senha</label>
                <PasswordInput
                  id="inputPassword"
                  name="password"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all bg-gray-50 focus:bg-white disabled:bg-gray-100 disabled:text-gray-500"
                  placeholder="Sua senha"
                  required
                  autoComplete="current-password"
                />
              </div>

              <button
                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-md hover:shadow-lg active:scale-[0.98] mt-4 disabled:opacity-70 disabled:cursor-not-allowed"
                type="submit"
              >
                {isLoginPending ? 'Entrando...' : 'Entrar'}
              </button>
            </fieldset>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Ou continue com</span>
              </div>
            </div>

            <GoogleButton onClick={handleGoogleLogin} />

            <div className="text-center space-y-3 pt-4 mt-2">
              <div className="">
                <Link to="/register" className="text-orange-600 hover:text-orange-800 font-medium transition-colors hover:underline">Não possui conta? Cadastre-se</Link>
              </div>
              <div>
                <Link to="/forgot-password" style={{ fontSize: '0.9rem' }} className="text-gray-400 hover:text-gray-600 transition-colors">Esqueci minha senha</Link>
              </div>
            </div>
          </form>
        </div>
      </div>
    </LoginContainer>
  );
};
