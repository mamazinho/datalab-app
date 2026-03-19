import React, { useMemo, useState } from 'react';
import PhoneInput, { getCountries } from 'react-phone-number-input';
import ptBR from 'react-phone-number-input/locale/pt';
import {
    AuthForm,
    AuthHeader,
    BrandHighlight,
    BrandTitle,
    Field,
    FieldsWrapper,
    Input,
    Label,
    PhoneNumberWrapper,
    PrimaryButton,
    Subtitle,
} from '../../../styles/design-system.style';

interface IRegisterFormProps extends React.FormHTMLAttributes<HTMLFormElement> {
    isPending: boolean;
}

export const RegisterForm: React.FC<IRegisterFormProps> = ({ isPending, ...props }) => {
    const phoneCountries = useMemo(() => getCountries(), []);
    const [phoneNumber, setPhoneNumber] = useState('');

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
                            required
                            autoComplete="email"
                        />
                    </Field>

                    <Field>
                        <Label htmlFor="inputPhoneNumber">Telefone</Label>
                        <PhoneNumberWrapper>
                            <PhoneInput
                                id="inputPhoneNumber"
                                name="phone_number"
                                countries={phoneCountries}
                                labels={ptBR}
                                international
                                countryCallingCodeEditable={false}
                                defaultCountry="BR"
                                value={phoneNumber}
                                onChange={(value) => setPhoneNumber(value || '')}
                                placeholder="Digite seu telefone"
                                autoComplete="tel"
                                required
                            />
                        </PhoneNumberWrapper>
                    </Field>

                    <Field>
                        <Label htmlFor="inputPassword">Senha</Label>
                        <Input
                            type="password"
                            id="inputPassword"
                            name="password"
                            placeholder="Sua senha"
                            required
                            autoComplete="new-password"
                        />
                    </Field>

                    <Field>
                        <Label htmlFor="inputConfirmPassword">Confirmar Senha</Label>
                        <Input
                            type="password"
                            id="inputConfirmPassword"
                            name="confirmPassword"
                            placeholder="Confirme sua senha"
                            required
                            autoComplete="new-password"
                        />
                    </Field>

                    <PrimaryButton type="submit">
                        {isPending ? "Processando..." : "Cadastrar"}
                    </PrimaryButton>
                </FieldsWrapper>
            </AuthForm>
        </>
    );
};
