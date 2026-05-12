import React, { useRef, useEffect, useActionState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { RegisterCard, RegisterContainer, RegisterFooter, RegisterFooterLink, RegisterShell } from './register.style';
import { DatalabAPI } from '../../services/datalab-api';
import { StepsController, type StepsRef } from '../../components/UI/Steps/steps-controller';
import { Step } from '../../components/UI/Steps/step';
import { toast } from 'react-toastify';
import { RegisterForm } from './components/register-form';
import { ConfirmAccountForm } from './components/confirm-account-form';
import { confirmUserAction, registerUserAction } from './actions';
import { INITIAL_ACTION_STATE, type ActionState } from '../../types/actions';
import type { IUserResponse } from '../../services/datalab-api/usersResource';
import { useGoogleLogin } from '../../hooks/useGoogleLogin';

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const stepsRef = useRef<StepsRef>(null);
  const { handleGoogleLogin } = useGoogleLogin();

  const [registerState, registerFormAction, isRegisterPending] = useActionState(registerUserAction, INITIAL_ACTION_STATE);
  const [confirmState, confirmFormAction, isConfirmPending] = useActionState(confirmUserAction, INITIAL_ACTION_STATE);

  const handleRegisterActionResult = useCallback((formState: ActionState<IUserResponse>) => {
    if (formState.success) {
      stepsRef.current?.next();
    } else if (formState.error) {
      toast.error(formState.error);
    }
  }, [stepsRef]);

  const handleConfirmActionResult = useCallback((formState: ActionState) => {
    if (formState.success) {
      toast.success("Conta confirmada com sucesso!");
      navigate('/login');
    } else if (formState.error) {
      toast.error(formState.error);
    }
  }, [navigate]);

  const handleResendCode = async () => {
    const userId = registerState.data?.id;
    const userEmail = registerState.data?.email;

    if (!userId) {
      toast.error("Usuário não encontrado para reenviar código.");
      return;
    }

    try {
      await DatalabAPI.UsersResource.resendConfirmationCode(userId);
      toast.success(`Novo código enviado para ${userEmail}`);
    } catch (error) {
      console.error("Erro ao reenviar código:", error);
      toast.error("Falha ao reenviar código de confirmação.");
    }
  };

  useEffect(() => {
    handleRegisterActionResult(registerState);
  }, [registerState, handleRegisterActionResult]);

  useEffect(() => {
    handleConfirmActionResult(confirmState);
  }, [confirmState, handleConfirmActionResult]);

  return (
    <RegisterContainer>
      <RegisterShell>
        <RegisterCard>
          <StepsController ref={stepsRef}>
            {/* STEP 1: Register Form */}
            <Step canGoForward={false}>
              <RegisterForm 
                action={registerFormAction}
                isPending={isRegisterPending}
                onGoogleLogin={handleGoogleLogin}
              />
            </Step>

            {/* STEP 2: Confirm Account */}
            <Step canGoBack={true}>
              <ConfirmAccountForm 
                action={confirmFormAction}
                isPending={isConfirmPending}
                userId={registerState.data?.id || null}
                email={registerState.data?.email || ''}
                onResendCode={handleResendCode}
              />
            </Step>
          </StepsController>
          <RegisterFooter>
            <RegisterFooterLink to="/login">Já possui conta? Faça Login</RegisterFooterLink>
          </RegisterFooter>
        </RegisterCard>
      </RegisterShell>
    </RegisterContainer>
  );
};
