import designSystemStyles from '../../styles/design-system.module.css';
import styles from './forgot-password.module.css';
import { Link, useSearchParams } from 'react-router-dom';
import React, { useActionState } from 'react';
import { TimedButton } from '../../components/UI/Buttons/timed-button';
import { forgotPasswordAction } from './actions';
import { INITIAL_ACTION_STATE } from '../../types/actions';
import { useActionFeedback } from '../../hooks/use-action-feedback';

export const ForgotPassword: React.FC = () => {
    const [searchParams] = useSearchParams();
    const [forgotPasswordState, forgotPasswordFormAction, isForgotPasswordPending] = useActionState(forgotPasswordAction, INITIAL_ACTION_STATE);

    useActionFeedback(forgotPasswordState, {
        successMessage: 'Um link de recuperação foi enviado para o seu email.',
    });

    return (
        <div className={styles.forgotPasswordContainer}>
            <div className={designSystemStyles.authShell}>
                <section className={designSystemStyles.authCard}>
                    <header className={designSystemStyles.authHeader}>
                        <h1 className={designSystemStyles.brandTitle}>DataLab <span className={designSystemStyles.brandHighlight}>App</span></h1>
                        <h2 className={designSystemStyles.subtitle}>Recuperar Senha</h2>
                        <p className={designSystemStyles.description}>
                            Informe seu email para receber um link de recuperação.
                        </p>
                    </header>

                    <form className={designSystemStyles.authForm} action={forgotPasswordFormAction}>
                        <fieldset className={designSystemStyles.fieldsWrapper} disabled={isForgotPasswordPending}>
                            <div className={designSystemStyles.field}>
                                <label className={designSystemStyles.label} htmlFor="inputEmail">Email</label>
                                <input className={designSystemStyles.input}
                                    type="email"
                                    id="inputEmail"
                                    name="email"
                                    placeholder="seu@email.com"
                                    defaultValue={searchParams.get('email') ?? ''}
                                    required
                                    autoFocus
                                    autoComplete="email"
                                />
                            </div>

                            <TimedButton
                                cooldown={120}
                                disabled={isForgotPasswordPending}
                                type="submit"
                                textWhenClicked="Reenviar Link"
                                textWhenNoClicked="Enviar Link"
                            />
                        </fieldset>

                        <div className={designSystemStyles.footerLinks}>
                            <Link className={styles.forgotPasswordBackLink} to="/login">Voltar para Login</Link>
                        </div>
                    </form>
                </section>
            </div>
        </div>
    );
};
