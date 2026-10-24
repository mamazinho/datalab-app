import designSystemStyles from '../../../styles/design-system.module.css';
import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PasswordInput } from '../../../components/UI/Inputs/Password/password-input';
import { PhoneField } from '../../../components/UI/Inputs/Phone';
import { SocialLoginButtons } from '../../../components/UI/Buttons/social-login-buttons';
import type { Provider } from '../../../types/integrations';

interface IRegisterFormProps extends React.FormHTMLAttributes<HTMLFormElement> {
    isPending: boolean;
    onSocialLogin: (provider: Provider) => void;
}

export const RegisterForm: React.FC<IRegisterFormProps> = ({ isPending, onSocialLogin, ...props }) => {
    const [searchParams] = useSearchParams();
    const emailFromQuery = searchParams.get('email') ?? '';
    const [phoneNumber, setPhoneNumber] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    return (
        <>
            <header className={designSystemStyles.authHeader}>
                <h1 className={designSystemStyles.brandTitle}>DataLab <span className={designSystemStyles.brandHighlight}>App</span></h1>
                <h2 className={designSystemStyles.subtitle}>Crie sua conta</h2>
            </header>
            <form className={designSystemStyles.authForm} {...props}>
                <fieldset className={designSystemStyles.fieldsWrapper} disabled={isPending}>
                    <div className={designSystemStyles.field}>
                        <label className={designSystemStyles.label} htmlFor="inputName">Nome Completo</label>
                        <input className={designSystemStyles.input}
                            type="text"
                            id="inputName"
                            name="name"
                            placeholder="Seu nome"
                            required
                            autoFocus
                            autoComplete="name"
                        />
                    </div>

                    <div className={designSystemStyles.field}>
                        <label className={designSystemStyles.label} htmlFor="inputEmail">Email</label>
                        <input className={designSystemStyles.input}
                            type="email"
                            id="inputEmail"
                            name="email"
                            placeholder="seu@email.com"
                            defaultValue={emailFromQuery}
                            required
                            autoComplete="email"
                        />
                    </div>

                    <div className={designSystemStyles.field}>
                        <label className={designSystemStyles.label} htmlFor="inputPhoneNumber">Telefone</label>
                        <PhoneField
                            id="inputPhoneNumber"
                            name="phone_number"
                            value={phoneNumber}
                            onValueChange={setPhoneNumber}
                            autoComplete="tel"
                            required
                            disabled={isPending}
                        />
                    </div>

                    <div className={designSystemStyles.field}>
                        <label className={designSystemStyles.label} htmlFor="inputPassword">Senha</label>
                        <PasswordInput
                            id="inputPassword"
                            name="password"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            placeholder="Sua senha"
                            required
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
                            placeholder="Confirme sua senha"
                            required
                            autoComplete="new-password"
                        />
                    </div>

                    <button className={designSystemStyles.primaryButton} type="submit">
                        {isPending ? "Processando..." : "Cadastrar"}
                    </button>
                </fieldset>

                <div className={designSystemStyles.formDivider}>
                    <div className={designSystemStyles.dividerLine} />
                    <span className={designSystemStyles.dividerText}>Ou continue com</span>
                </div>

                <SocialLoginButtons onSelect={onSocialLogin} />
            </form>
        </>
    );
};
