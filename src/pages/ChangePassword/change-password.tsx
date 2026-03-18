import React, { useActionState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ChangePasswordCancelLink,
  ChangePasswordCard,
  ChangePasswordContainer,
  ChangePasswordFooter,
  ChangePasswordShell,
} from './change-password.style';
import { toast } from 'react-toastify';
import { changePasswordAction } from './actions';
import { INITIAL_ACTION_STATE, type ActionState } from '../../types/actions';
import { PasswordInput } from '../../components/UI/Inputs/password-input';
import { AuthForm, AuthHeader, BrandHighlight, BrandTitle, Description, ErrorText, Field, FieldsWrapper, Label, PrimaryButton, Subtitle } from '../../styles/design-system.style';


export const ChangePassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [changePasswordState, changePasswordFormAction, isChangePasswordPending] = useActionState(changePasswordAction, INITIAL_ACTION_STATE);

  const email = searchParams.get('email') || '';
  const code = searchParams.get('code') || '';

  const handleChangePasswordResult = useCallback((formState: ActionState) => {
    if (formState.timestamp === 0) return;
    if (formState.success) {
        toast.success("Senha alterada com sucesso!");
        setTimeout(() => {
            navigate('/login');
        }, 3000);
    } 
  }, [navigate]);

  useEffect(() => {
    handleChangePasswordResult(changePasswordState);
  }, [changePasswordState, handleChangePasswordResult]);

  return (
    <ChangePasswordContainer>
      <ChangePasswordShell>
        <ChangePasswordCard>
          <AuthHeader>
            <BrandTitle>DataLab <BrandHighlight>App</BrandHighlight></BrandTitle>
            <Subtitle>Redefinir Senha</Subtitle>
            <Description>Crie uma nova senha para sua conta.</Description>
          </AuthHeader>
          
          <AuthForm action={changePasswordFormAction}>
            <input type="hidden" name="email" value={email} />
            <input type="hidden" name="code" value={code} />
            
            <FieldsWrapper disabled={isChangePasswordPending}>
              <Field>
                <Label htmlFor="inputPassword">Nova Senha</Label>
                <PasswordInput
                    id="inputPassword" 
                    name="password"
                    required 
                    autoFocus
                    autoComplete="new-password"
                />
              </Field>

              <Field>
                <Label htmlFor="inputConfirmPassword">Confirmar Senha</Label>
                <PasswordInput
                    id="inputConfirmPassword" 
                    name="confirmPassword"
                    required 
                    autoComplete="new-password"
                />
                {changePasswordState.error && <ErrorText>{changePasswordState.error}</ErrorText>}
              </Field>

              <PrimaryButton type="submit">
                  {isChangePasswordPending ? 'Alterando...' : 'Alterar Senha'}
              </PrimaryButton>
            </FieldsWrapper>
            
            <ChangePasswordFooter>
               <ChangePasswordCancelLink to="/login">Cancelar</ChangePasswordCancelLink>
            </ChangePasswordFooter>
          </AuthForm>
        </ChangePasswordCard>
      </ChangePasswordShell>
    </ChangePasswordContainer>
  );
};
