import React, { useCallback, useEffect, useActionState } from 'react';
import {
    ForgotPasswordBackLink,
    ForgotPasswordCard,
    ForgotPasswordContainer,
    ForgotPasswordFooter,
    ForgotPasswordShell,
} from './forgot-password.style';
import { TimedButton } from '../../components/UI/Buttons/timed-button';
import { forgotPasswordAction } from './actions';
import { INITIAL_ACTION_STATE, type ActionState } from '../../types/actions';
import { AuthForm, AuthHeader, BrandHighlight, BrandTitle, Description, Field, FieldsWrapper, Input, Label, Subtitle } from '../../styles/design-system.style';

export const ForgotPassword: React.FC = () => {
    const [forgotPasswordState, forgotPasswordFormAction, isForgotPasswordPending] = useActionState(forgotPasswordAction, INITIAL_ACTION_STATE);

    const handleForgotPasswordResult = useCallback((formState: ActionState) => {
        if (formState.timestamp === 0) return;
        if (formState.success) {
            alert("Um link de recuperação foi enviado para o seu email.");
        } else if (formState.error) {
            console.log("Falha ao enviar o link de recuperação.", formState.error);
        }
    }, [])

    useEffect(() => {
        handleForgotPasswordResult(forgotPasswordState);
    }, [forgotPasswordState, handleForgotPasswordResult]);

    return (
        <ForgotPasswordContainer>
            <ForgotPasswordShell>
                <ForgotPasswordCard>
                    <AuthHeader>
                        <BrandTitle>DataLab <BrandHighlight>App</BrandHighlight></BrandTitle>
                        <Subtitle>Recuperar Senha</Subtitle>
                        <Description>
                            Informe seu email para receber um link de recuperação.
                        </Description>
                    </AuthHeader>

                    <AuthForm action={forgotPasswordFormAction}>
                        <FieldsWrapper disabled={isForgotPasswordPending}>
                            <Field>
                                <Label htmlFor="inputEmail">Email</Label>
                                <Input
                                    type="email"
                                    id="inputEmail"
                                    name="email"
                                    placeholder="seu@email.com"
                                    required
                                    autoFocus
                                    autoComplete="email"
                                />
                            </Field>

                            <TimedButton
                                cooldown={120}
                                disabled={isForgotPasswordPending}
                                type="submit"
                                textWhenClicked="Reenviar Link"
                                textWhenNoClicked="Enviar Link"
                            />
                        </FieldsWrapper>

                        <ForgotPasswordFooter>
                            <ForgotPasswordBackLink to="/login">Voltar para Login</ForgotPasswordBackLink>
                        </ForgotPasswordFooter>
                    </AuthForm>
                </ForgotPasswordCard>
            </ForgotPasswordShell>
        </ForgotPasswordContainer>
    );
};
