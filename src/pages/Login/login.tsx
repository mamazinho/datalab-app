import React, { useActionState } from 'react';
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
import { SocialLoginButtons } from '../../components/UI/Buttons/social-login-buttons';
import { loginAction } from './actions';
import { INITIAL_ACTION_STATE } from '../../types/actions';
import { PasswordInput } from '../../components/UI/Inputs/Password/password-input';
import { useSocialLogin } from '../../hooks/use-social-login';
import { useActionFeedback } from '../../hooks/use-action-feedback';

export const Login: React.FC = () => {
  const [loginState, loginFormAction, isLoginPending] = useActionState(loginAction, INITIAL_ACTION_STATE);
  const { login } = useAuthContext();
  const navigate = useNavigate();
  const { handleSocialLogin } = useSocialLogin();

  useActionFeedback(loginState, {
    onSuccess: async (data) => {
      if (!data) return;
      await login(data);
      navigate('/');
    },
  });

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

            <SocialLoginButtons onSelect={handleSocialLogin} />

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
