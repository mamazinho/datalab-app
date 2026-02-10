import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RegisterContainer } from './register.style';
import { DatalabAPI } from '../../services/datalab-api';
import { StepsController, type StepsRef } from '../../components/UI/Steps/steps-controller';
import { Step } from '../../components/UI/Steps/step';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { RegisterForm } from './components/register-form';
import { ConfirmAccountForm } from './components/confirm-account-form';
import type { IRegisterUserRequest } from '../../services/datalab-api/usersResource';

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const stepsRef = useRef<StepsRef>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [userEmail, setUserEmail] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (data: IRegisterUserRequest) => {
    setIsLoading(true);
    try {
      const response = await DatalabAPI.UsersResource.create({
        name: data.name,
        email: data.email,
        password: data.password
      });
      setUserId(response.id);
      setUserEmail(data.email);
      stepsRef.current?.next();
    } catch (error) {
      console.error("Cadastro falhou:", error);
      toast.error("Erro ao realizar cadastro.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirm = async (code: string) => {
    if (!userId) return;

    setIsLoading(true);
    try {
      await DatalabAPI.UsersResource.confirmAccount(userId, { code });
      toast.success("Conta confirmada com sucesso!");
      navigate('/login');
    } catch (error) {
      console.error("Confirmação falhou:", error);
      toast.error("Código inválido ou erro na confirmação.");
    } finally {
      setIsLoading(false);
    }
  };
  const handleResendCode = async () => {
     if (!userId) {
      toast.error("Usuário não encontrado para reenviar código.");
      return;
     }
     await DatalabAPI.UsersResource.resendConfirmationCode(userId);
     toast.success(`Novo código enviado para ${userEmail}`);
  };
  return (
    <RegisterContainer>
      <div className="flex items-center justify-center min-h-[80vh] p-4">
        <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
          <StepsController ref={stepsRef}>
            {/* STEP 1: Register Form */}
            <Step canGoForward={false}>
              <RegisterForm 
                onSubmit={handleRegister}
                isLoading={isLoading}
              />
            </Step>

            {/* STEP 2: Confirm Account */}
            <Step canGoBack={true}>
              <ConfirmAccountForm 
                onSubmit={handleConfirm}
                isLoading={isLoading}
                email={userEmail}
                onResendCode={handleResendCode}
              />
            </Step>
          </StepsController>
          <div className={`text-center pt-4 border-t border-gray-100 mt-6 flex flex-col gap-2`}>
            <Link to="/login" className="text-orange-600 hover:text-orange-800 font-medium transition-colors hover:underline">Já possui conta? Faça Login</Link>
          </div>
        </div>
      </div>
    </RegisterContainer>
  );
};
