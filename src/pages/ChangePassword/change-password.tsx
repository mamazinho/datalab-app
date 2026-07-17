import React, { useActionState, useState } from 'react';
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
import { INITIAL_ACTION_STATE } from '../../types/actions';
import { useActionFeedback } from '../../hooks/use-action-feedback';
import { PasswordInput } from '../../components/UI/Inputs/Password/password-input';
import { AuthForm, AuthHeader, BrandHighlight, BrandTitle, Description, ErrorText, Field, FieldsWrapper, Label, PrimaryButton, Subtitle } from '../../styles/design-system.style';


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
    // Erro já aparece inline no formulário — sem toast duplicado
    onError: () => {},
  });

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
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                    required
                    autoFocus
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
