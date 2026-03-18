import React from 'react';
import { TimedButton } from '../../../components/UI/Buttons/timed-button';
import {
    AuthForm,
    AuthHeader,
    BrandHighlight,
    BrandTitle,
    Description,
    Field,
    FieldsWrapper,
    Input,
    Label,
    PrimaryButton,
    Subtitle,
} from '../../../styles/design-system.style';
import styled from 'styled-components';

interface IConfirmAccountFormProps extends React.FormHTMLAttributes<HTMLFormElement> {
    isPending: boolean;
    email: string;
    userId: number | null;
    onResendCode: () => Promise<void>;
}

const CodeInput = styled(Input)`
    text-align: center;
    letter-spacing: 0.35rem;
    font-size: 1.05rem;
`;

const Actions = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.85rem;
    margin-top: 0.5rem;
`;

export const ConfirmAccountForm: React.FC<IConfirmAccountFormProps> = ({
    isPending,
    email,
    userId,
    onResendCode,
    ...props
}) => {
    return (
        <>
            <AuthHeader>
                <BrandTitle>DataLab <BrandHighlight>App</BrandHighlight></BrandTitle>
                <Subtitle>Confirmar Conta</Subtitle>
                <Description>
                    Digite o código de 6 dígitos enviado para <b>{email}</b>.
                </Description>
            </AuthHeader>
            <AuthForm {...props}>
                <FieldsWrapper disabled={isPending}>
                    <input type="hidden" name="userId" value={userId || ''} />
                    <Field>
                        <Label htmlFor="inputCode">Código de Confirmação</Label>
                        <CodeInput
                            type="text"
                            id="inputCode"
                            name="code"
                            placeholder="000000"
                            required
                            autoFocus
                            maxLength={6}
                            autoComplete="one-time-code"
                        />
                    </Field>

                    <Actions>
                        <PrimaryButton type="submit">
                            {isPending ? "Processando..." : "Confirmar Conta"}
                        </PrimaryButton>

                        <TimedButton
                            cooldown={120}
                            disabled={false}
                            onClick={onResendCode}
                            textWhenClicked="Reenviar Código"
                            textWhenNoClicked="Reenviar Código"
                            appearance="secondary"
                        />
                    </Actions>
                </FieldsWrapper>
            </AuthForm>
        </>
    );
};
