import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
    AuthForm,
    AuthHeader,
    BrandHighlight,
    BrandTitle,
    Field,
    FieldsWrapper,
    FormDivider,
    DividerLine,
    DividerText,
    Input,
    Label,
    PrimaryButton,
    Subtitle,
} from '../../../styles/design-system.style';
import { PasswordInput } from '../../../components/UI/Inputs/Password/password-input';
import { PhoneField } from '../../../components/UI/Inputs/Phone';
import { GoogleButton } from '../../../components/UI/Buttons/google-button';

interface IRegisterFormProps extends React.FormHTMLAttributes<HTMLFormElement> {
    isPending: boolean;
    onGoogleLogin: () => void;
}

export const RegisterForm: React.FC<IRegisterFormProps> = ({ isPending, onGoogleLogin, ...props }) => {
    const [searchParams] = useSearchParams();
    const emailFromQuery = searchParams.get('email') ?? '';
    const [phoneNumber, setPhoneNumber] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    return (
        <>
            <AuthHeader>
                <BrandTitle>DataLab <BrandHighlight>App</BrandHighlight></BrandTitle>
                <Subtitle>Crie sua conta</Subtitle>
            </AuthHeader>
            <AuthForm {...props}>
                <FieldsWrapper disabled={isPending}>
                    <Field>
                        <Label htmlFor="inputName">Nome Completo</Label>
                        <Input
                            type="text"
                            id="inputName"
                            name="name"
                            placeholder="Seu nome"
                            required
                            autoFocus
                            autoComplete="name"
                        />
                    </Field>

                    <Field>
                        <Label htmlFor="inputEmail">Email</Label>
                        <Input
                            type="email"
                            id="inputEmail"
                            name="email"
                            placeholder="seu@email.com"
                            defaultValue={emailFromQuery}
                            required
                            autoComplete="email"
                        />
                    </Field>

                    <Field>
                        <Label htmlFor="inputPhoneNumber">Telefone</Label>
                        <PhoneField
                            id="inputPhoneNumber"
                            name="phone_number"
                            value={phoneNumber}
                            onValueChange={setPhoneNumber}
                            placeholder="Digite seu telefone"
                            autoComplete="tel"
                            required
                            disabled={isPending}
                        />
                    </Field>

                    <Field>
                        <Label htmlFor="inputPassword">Senha</Label>
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
                    </Field>

                    <Field>
                        <Label htmlFor="inputConfirmPassword">Confirmar Senha</Label>
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
                    </Field>

                    <PrimaryButton type="submit">
                        {isPending ? "Processando..." : "Cadastrar"}
                    </PrimaryButton>
                </FieldsWrapper>

                <FormDivider>
                    <DividerLine />
                    <DividerText>Ou continue com</DividerText>
                </FormDivider>

                <GoogleButton onClick={onGoogleLogin} />
            </AuthForm>
        </>
    );
};
