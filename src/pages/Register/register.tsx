import designSystemStyles from '../../styles/design-system.module.css';
import styles from './register.module.css';
import { Link } from 'react-router-dom';
import React, { useRef, useActionState, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
import { clearPendingRegistration, loadPendingRegistration, savePendingRegistration } from './pending-registration';

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const stepsRef = useRef<StepsRef>(null);
  const { handleSocialLogin } = useSocialLogin();
  const [pendingRegistration, setPendingRegistration] = useState(loadPendingRegistration);

  const [registerState, registerFormAction, isRegisterPending] = useActionState(registerUserAction, INITIAL_ACTION_STATE);
  const [confirmState, confirmFormAction, isConfirmPending] = useActionState(confirmUserAction, INITIAL_ACTION_STATE);

  const emailFromLink = searchParams.get('email')?.toLowerCase();
  const resumesPendingRegistration =
    !!pendingRegistration && (!emailFromLink || emailFromLink === pendingRegistration.email);
  const codeFromLink = resumesPendingRegistration ? searchParams.get('code') ?? '' : '';

  useActionFeedback(registerState, {
    onSuccess: (user) => {
      if (user) {
        const registration = { id: user.id, email: user.email };
        savePendingRegistration(registration);
        setPendingRegistration(registration);
      }
      stepsRef.current?.next();
    },
  });

  useActionFeedback(confirmState, {
    successMessage: 'Conta confirmada com sucesso!',
    onSuccess: () => {
      clearPendingRegistration();
      navigate('/login');
    },
  });

  const handleResendCode = async () => {
    if (!pendingRegistration) {
      toast.error("Usuário não encontrado para reenviar código.");
      return;
    }

    try {
      await DatalabAPI.UsersResource.resendConfirmationCode(pendingRegistration.id);
      toast.success(`Novo código enviado para ${pendingRegistration.email}`);
    } catch (error) {
      console.error("Erro ao reenviar código:", error);
      toast.error("Falha ao reenviar código de confirmação.");
    }
  };

  return (
    <div className={styles.registerContainer}>
      <div className={designSystemStyles.authShell}>
        <section className={designSystemStyles.authCard}>
          <StepsController ref={stepsRef} initialStep={resumesPendingRegistration ? 2 : 1}>
                        <Step canGoForward={false}>
              <RegisterForm 
                action={registerFormAction}
                isPending={isRegisterPending}
                onSocialLogin={handleSocialLogin}
              />
            </Step>

                        <Step canGoBack={true}>
              <ConfirmAccountForm 
                action={confirmFormAction}
                isPending={isConfirmPending}
                userId={pendingRegistration?.id ?? null}
                email={pendingRegistration?.email ?? ''}
                defaultCode={codeFromLink}
                onResendCode={handleResendCode}
              />
            </Step>
          </StepsController>
          <div className={styles.registerFooter}>
            <Link className={styles.registerFooterLink} to="/login">Já possui conta? Faça Login</Link>
          </div>
        </section>
      </div>
    </div>
  );
};
