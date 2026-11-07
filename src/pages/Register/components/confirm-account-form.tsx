import styles from './confirm-account-form.module.css';
import designSystemStyles from '../../../styles/design-system.module.css';
import React from 'react';
import { TimedButton } from '../../../components/UI/Buttons/timed-button';
import type { UUID7 } from '../../../types/ids';
import { FormFieldset, SubmitButton } from '../../../components/UI/Forms';

interface IConfirmAccountFormProps extends React.FormHTMLAttributes<HTMLFormElement> {
    email: string;
    userId: UUID7 | null;
    defaultCode?: string;
    onResendCode: () => Promise<void>;
}
export const ConfirmAccountForm: React.FC<IConfirmAccountFormProps> = ({
    email,
    userId,
    defaultCode = '',
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
                <FormFieldset className={designSystemStyles.fieldsWrapper}>
                    <input type="hidden" name="userId" value={userId || ''} />
                    <div className={designSystemStyles.field}>
                        <label className={designSystemStyles.label} htmlFor="inputCode">Código de Confirmação</label>
                        <input className={styles.codeInput}
                            type="text"
                            id="inputCode"
                            name="code"
                            placeholder="000000"
                            defaultValue={defaultCode}
                            required
                            autoFocus
                            maxLength={6}
                            autoComplete="one-time-code"
                        />
                    </div>

                    <div className={styles.actions}>
                        <SubmitButton className={designSystemStyles.primaryButton} pendingLabel="Processando...">
                            Confirmar Conta
                        </SubmitButton>

                        <TimedButton
                            cooldown={120}
                            disabled={false}
                            onClick={onResendCode}
                            textWhenClicked="Reenviar Código"
                            textWhenNoClicked="Reenviar Código"
                            appearance="secondary"
                        />
                    </div>
                </FormFieldset>
            </form>
        </>
    );
};
