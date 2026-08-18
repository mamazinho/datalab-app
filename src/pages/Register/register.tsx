import React, { useRef, useActionState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RegisterCard, RegisterContainer, RegisterFooter, RegisterFooterLink, RegisterShell } from './register.style';
import { DatalabAPI } from '../../services/datalab-api';
import { StepsController, type StepsRef } from '../../components/UI/Steps/steps-controller';
import { Step } from '../../components/UI/Steps/step';
import { toast } from 'react-toastify';
import { RegisterForm } from './components/register-form';
import { ConfirmAccountForm } from './components/confirm-account-form';
import { confirmUserAction, registerUserAction } from './actions';
import { INITIAL_ACTION_STATE } from '../../types/actions';
import { useSocialLogin } from '../../hooks/use-social-login';
import { useActionFeedback } from '../../hooks/use-action-feedback';

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const stepsRef = useRef<StepsRef>(null);
  const { handleSocialLogin } = useSocialLogin();

  const [registerState, registerFormAction, isRegisterPending] = useActionState(registerUserAction, INITIAL_ACTION_STATE);
  const [confirmState, confirmFormAction, isConfirmPending] = useActionState(confirmUserAction, INITIAL_ACTION_STATE);

  useActionFeedback(registerState, {
    onSuccess: () => stepsRef.current?.next(),
  });

  useActionFeedback(confirmState, {
    successMessage: 'Conta confirmada com sucesso!',
    onSuccess: () => navigate('/login'),
  });

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
                onSocialLogin={handleSocialLogin}
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
