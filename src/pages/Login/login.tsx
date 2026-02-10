import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LoginContainer } from './login.style';
import { useAuthContext } from '../../contexts/auth';
import { toast } from 'react-toastify';
import { GoogleButton } from '../../components/UI/Buttons/google-button';
import { DatalabAPI } from '../../services/datalab-api';
import type { ILoginUserRequest, ILoginUserResponse } from '../../services/datalab-api/authResource';

export interface ISocialLoginCallbackEvent {
  type: string;
  response: ILoginUserResponse;
}

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuthContext();
  const navigate = useNavigate();
  const popupRef = useRef<Window | null>(null);

  useEffect(() => {
    const authChannel = new BroadcastChannel('auth_channel');

    authChannel.onmessage = (event: MessageEvent<ISocialLoginCallbackEvent>) => {
      const validAuthEventTypes = ['GOOGLE_LOGIN_SUCCESS'];

      if (validAuthEventTypes.includes(event.data.type) && event.data.response.access_token) {
        login(event.data.response);
        if (popupRef.current) {
          popupRef.current.close();
          popupRef.current = null;
        }
        navigate('/');
      }
    };

    return () => {
      authChannel.close();
    };
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

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    const loginData: ILoginUserRequest = {
      email: email,
      password: password,
    };
    try {
      const response = await DatalabAPI.AuthResource.login(loginData)
      login(response);
      navigate('/')
    } catch (error) {
      toast.error(`Falha no login: ${error}`);
    }
  };

  return (
    <LoginContainer>
      <div className="flex items-center justify-center min-h-[80vh] p-4">
        <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold text-gray-800 mb-2">DataLab <span className="text-orange-600">App</span></h1>
            <h2 className="text-gray-500 text-lg font-medium">Benvindo de volta!</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1">
              <label htmlFor="inputEmail" className="block text-sm font-semibold text-gray-700 ml-1">Email</label>
              <input
                type="email"
                id="inputEmail"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all bg-gray-50 focus:bg-white"
                placeholder="seu@email.com"
                required
                autoFocus
                value={email}
                autoComplete="email"
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="inputPassword" className="block text-sm font-semibold text-gray-700 ml-1">Senha</label>
              <input
                type="password"
                id="inputPassword"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all bg-gray-50 focus:bg-white"
                placeholder="Sua senha"
                required
                value={password}
                autoComplete="current-password"
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-md hover:shadow-lg active:scale-[0.98] mt-4" type="submit">Entrar</button>

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
