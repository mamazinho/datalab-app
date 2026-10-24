import styles from './confirm-account-form.module.css';
import designSystemStyles from '../../../styles/design-system.module.css';
import React from 'react';
import { TimedButton } from '../../../components/UI/Buttons/timed-button';
import type { UUID7 } from '../../../types/ids';

interface IConfirmAccountFormProps extends React.FormHTMLAttributes<HTMLFormElement> {
    isPending: boolean;
    email: string;
    userId: UUID7 | null;
    onResendCode: () => Promise<void>;
}
export const ConfirmAccountForm: React.FC<IConfirmAccountFormProps> = ({
    isPending,
    email,
    userId,
    onResendCode,
    ...props
}) => {
    return (
        <>
            <header className={designSystemStyles.authHeader}>
                <h1 className={designSystemStyles.brandTitle}>DataLab <span className={designSystemStyles.brandHighlight}>App</span></h1>
                <h2 className={designSystemStyles.subtitle}>Confirmar Conta</h2>
                <p className={designSystemStyles.description}>
                    Digite o código de 6 dígitos enviado para <b>{email}</b>.
                </p>
            </header>
            <form className={designSystemStyles.authForm} {...props}>
                <fieldset className={designSystemStyles.fieldsWrapper} disabled={isPending}>
                    <input type="hidden" name="userId" value={userId || ''} />
                    <div className={designSystemStyles.field}>
                        <label className={designSystemStyles.label} htmlFor="inputCode">Código de Confirmação</label>
                        <input className={styles.codeInput}
                            type="text"
                            id="inputCode"
                            name="code"
                            placeholder="000000"
                            required
                            autoFocus
                            maxLength={6}
                            autoComplete="one-time-code"
                        />
                    </div>

                    <div className={styles.actions}>
                        <button className={designSystemStyles.primaryButton} type="submit">
                            {isPending ? "Processando..." : "Confirmar Conta"}
                        </button>

                        <TimedButton
                            cooldown={120}
                            disabled={false}
                            onClick={onResendCode}
                            textWhenClicked="Reenviar Código"
                            textWhenNoClicked="Reenviar Código"
                            appearance="secondary"
                        />
                    </div>
                </fieldset>
            </form>
        </>
    );
};
