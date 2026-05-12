import React, { useEffect, useActionState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LoginButton,
  LoginCard,
  LoginContainer,
  LoginDivider,
  LoginDividerLine,
  LoginDividerText,
  LoginField,
  LoginFieldset,
  LoginFooterLinks,
  LoginForgotLink,
  LoginForm,
  LoginHeader,
  LoginInput,
  LoginLabel,
  LoginRegisterLink,
  LoginShell,
  LoginSubtitle,
  LoginTitle,
} from './login.style';
import { useAuthContext } from '../../contexts/auth';
import { toast } from 'react-toastify';
import { GoogleButton } from '../../components/UI/Buttons/google-button';
import { loginAction } from './actions';
import type { ILoginUserResponse } from '../../services/datalab-api/authResource';
import { INITIAL_ACTION_STATE, type ActionState } from '../../types/actions';
import { PasswordInput } from '../../components/UI/Inputs/Password/password-input';
import { useGoogleLogin } from '../../hooks/useGoogleLogin';

export const Login: React.FC = () => {
  const [loginState, loginFormAction, isLoginPending] = useActionState(loginAction, INITIAL_ACTION_STATE);
  const { login } = useAuthContext();
  const navigate = useNavigate();
  const { handleGoogleLogin } = useGoogleLogin();

  const handleLoginActionResult = useCallback(async (formState: ActionState<ILoginUserResponse>) => {
    if (formState.timestamp === 0) return;
    if (formState.success && formState.data) {
      await login(formState.data);
      navigate('/');
    } else if (formState.error) {
      toast.error(formState.error);
    }
  }, [login, navigate]);

  // Form submission result effect
  useEffect(() => {
    handleLoginActionResult(loginState);
  }, [loginState, handleLoginActionResult]);

  return (
    <LoginContainer>
      <LoginShell>
        <LoginCard>
          <LoginHeader>
            <LoginTitle>DataLab <span>App</span></LoginTitle>
            <LoginSubtitle>Benvindo de volta!</LoginSubtitle>
          </LoginHeader>

          <LoginForm action={loginFormAction}>
            <LoginFieldset disabled={isLoginPending}>
              <LoginField>
                <LoginLabel htmlFor="inputEmail">Email</LoginLabel>
                <LoginInput
                  type="email"
                  id="inputEmail"
                  name="email"
                  placeholder="seu@email.com"
                  required
                  autoFocus
                  autoComplete="email"
                />
              </LoginField>

              <LoginField>
                <LoginLabel htmlFor="inputPassword">Senha</LoginLabel>
                <PasswordInput
                  id="inputPassword"
                  name="password"
                  placeholder="Sua senha"
                  required
                  autoComplete="current-password"
                />
              </LoginField>

              <LoginButton type="submit">
                {isLoginPending ? 'Entrando...' : 'Entrar'}
              </LoginButton>
            </LoginFieldset>

            <LoginDivider>
              <LoginDividerLine />
              <LoginDividerText>Ou continue com</LoginDividerText>
            </LoginDivider>

            <GoogleButton onClick={handleGoogleLogin} />

            <LoginFooterLinks>
              <LoginRegisterLink to="/cadastro">Não possui conta? Cadastre-se</LoginRegisterLink>
              <LoginForgotLink to="/esqueci-senha">Esqueci minha senha</LoginForgotLink>
            </LoginFooterLinks>
          </LoginForm>
        </LoginCard>
      </LoginShell>
    </LoginContainer>
  );
};
