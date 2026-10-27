import designSystemStyles from '../../styles/design-system.module.css';
import styles from './change-password.module.css';
import { Link } from 'react-router-dom';
import React, { useActionState, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { changePasswordAction } from './actions';
import { INITIAL_ACTION_STATE } from '../../types/actions';
import { useActionFeedback } from '../../hooks/use-action-feedback';
import { PasswordInput } from '../../components/UI/Inputs/Password/password-input';

export const ChangePassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [changePasswordState, changePasswordFormAction, isChangePasswordPending] = useActionState(changePasswordAction, INITIAL_ACTION_STATE);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const email = searchParams.get('email') || '';
  const code = searchParams.get('code') || '';

  useActionFeedback(changePasswordState, {
    onSuccess: () => {
      toast.success('Senha alterada com sucesso!');
      setTimeout(() => navigate('/login'), 3000);
    },
    // The error shows inline in the form
    onError: () => {},
  });

  return (
    <div className={styles.changePasswordContainer}>
      <div className={designSystemStyles.authShell}>
        <section className={designSystemStyles.authCard}>
          <header className={designSystemStyles.authHeader}>
            <h1 className={designSystemStyles.brandTitle}>DataLab <span className={designSystemStyles.brandHighlight}>App</span></h1>
            <h2 className={designSystemStyles.subtitle}>Redefinir Senha</h2>
            <p className={designSystemStyles.description}>Crie uma nova senha para sua conta.</p>
          </header>
          <form className={designSystemStyles.authForm} action={changePasswordFormAction}>
            <input type="hidden" name="email" value={email} />
            <input type="hidden" name="code" value={code} />
            <fieldset className={designSystemStyles.fieldsWrapper} disabled={isChangePasswordPending}>
              <div className={designSystemStyles.field}>
                <label className={designSystemStyles.label} htmlFor="inputPassword">Nova Senha</label>
                <PasswordInput
                    id="inputPassword"
                    name="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                    required
                    autoFocus
                    autoComplete="new-password"
                    showRequirements
                />
              </div>

              <div className={designSystemStyles.field}>
                <label className={designSystemStyles.label} htmlFor="inputConfirmPassword">Confirmar Senha</label>
                <PasswordInput
                    id="inputConfirmPassword" 
                    name="confirmPassword"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  matchValue={password}
                    required 
                    autoComplete="new-password"
                />
                {changePasswordState.error && <p className={designSystemStyles.errorText}>{changePasswordState.error}</p>}
              </div>

              <button className={designSystemStyles.primaryButton} type="submit">
                  {isChangePasswordPending ? 'Alterando...' : 'Alterar Senha'}
              </button>
            </fieldset>
            <div className={designSystemStyles.footerLinks}>
               <Link className={styles.changePasswordCancelLink} to="/login">Cancelar</Link>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
};
