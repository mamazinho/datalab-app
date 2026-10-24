import designSystemStyles from '../../styles/design-system.module.css';
import styles from './login.module.css';
import { Link } from 'react-router-dom';
import React, { useActionState } from 'react';
import { useNavigate } from 'react-router-dom';
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
    <div className={styles.loginContainer}>
      <div className={designSystemStyles.authShell}>
        <section className={designSystemStyles.authCard}>
          <header className={designSystemStyles.authHeader}>
            <h1 className={designSystemStyles.brandTitle}>DataLab <span>App</span></h1>
            <h2 className={designSystemStyles.subtitle}>Bem vindo de volta!</h2>
          </header>

          <form className={designSystemStyles.authForm} action={loginFormAction}>
            <fieldset className={designSystemStyles.fieldsWrapper} disabled={isLoginPending}>
              <div className={designSystemStyles.field}>
                <label className={designSystemStyles.label} htmlFor="inputEmail">Email</label>
                <input className={designSystemStyles.input}
                  type="email"
                  id="inputEmail"
                  name="email"
                  placeholder="seu@email.com"
                  required
                  autoFocus
                  autoComplete="email"
                />
              </div>

              <div className={designSystemStyles.field}>
                <label className={designSystemStyles.label} htmlFor="inputPassword">Senha</label>
                <PasswordInput
                  id="inputPassword"
                  name="password"
                  placeholder="Sua senha"
                  required
                  autoComplete="current-password"
                />
              </div>

              <button className={styles.loginButton} type="submit">
                {isLoginPending ? 'Entrando...' : 'Entrar'}
              </button>
            </fieldset>

            <div className={designSystemStyles.formDivider}>
              <div className={designSystemStyles.dividerLine} />
              <span className={designSystemStyles.dividerText}>Ou continue com</span>
            </div>

            <SocialLoginButtons onSelect={handleSocialLogin} />

            <div className={styles.loginFooterLinks}>
              <Link className={styles.loginRegisterLink} to="/cadastro">Não possui conta? Cadastre-se</Link>
              <Link className={styles.loginForgotLink} to="/esqueci-senha">Esqueci minha senha</Link>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
};
