import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RegisterContainer } from './register.style';
import { DatalabAPI } from '../../services/datalab-api';
import { TimedButton } from '../../components/UI/Buttons/timed-button';
import { StepsController, type StepsRef } from '../../components/UI/Steps/steps-controller';
import { Step } from '../../components/UI/Steps/step';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const stepsRef = useRef<StepsRef>(null);
  const [userId, setUserId] = useState<number | null>(null);
  
  // Form States
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (e: React.SubmitEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("As senhas não coincidem.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await DatalabAPI.UsersResource.create({
        name,
        email,
        password
      });
      setUserId(response.id);
      stepsRef.current?.next();
    } catch (error) {
      console.error("Cadastro falhou:", error);
      toast.error("Erro ao realizar cadastro.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirm = async (e: React.SyntheticEvent) => {
    e.preventDefault();
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
     toast.success(`Novo código enviado para ${email}`);
  };
  return (
    <RegisterContainer>
      <div className="flex items-center justify-center min-h-[80vh] p-4">
        <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
          <StepsController ref={stepsRef}>
            {/* STEP 1: Register Form */}
            <Step canGoForward={false}>
              <div className="text-center mb-8">
                <h1 className="text-3xl font-extrabold text-gray-800 mb-2">DataLab <span className="text-orange-600">App</span></h1>
                <h2 className="text-gray-500 text-lg font-medium">Crie sua conta</h2>
              </div>
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-1">
                  <label htmlFor="inputName" className="block text-sm font-semibold text-gray-700 ml-1">Nome Completo</label>
                  <input 
                    type="text" 
                    id="inputName" 
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all bg-gray-50 focus:bg-white" 
                    placeholder="Seu nome" 
                    required 
                    autoFocus
                    value={name}
                    autoComplete="name"
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="inputEmail" className="block text-sm font-semibold text-gray-700 ml-1">Email</label>
                  <input 
                    type="email" 
                    id="inputEmail" 
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all bg-gray-50 focus:bg-white" 
                    placeholder="seu@email.com" 
                    required 
                    value={email}
                    autoComplete="email"
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="inputPassword" className="block text-sm font-semibold text-gray-700 ml-1">Senha</label>
                  <input 
                    type="password" 
                    id="inputPassword" 
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all bg-gray-50 focus:bg-white" 
                    placeholder="Sua senha" 
                    required
                    value={password}
                    autoComplete="new-password"
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="inputConfirmPassword" className="block text-sm font-semibold text-gray-700 ml-1">Confirmar Senha</label>
                  <input 
                    type="password" 
                    id="inputConfirmPassword" 
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all bg-gray-50 focus:bg-white" 
                    placeholder="Confirme sua senha" 
                    required
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>

                <button 
                  className="w-full bg-orange-600 hover:bg-orange-700 disabled:opacity-70 disabled:cursor-wait text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-md hover:shadow-lg active:scale-[0.98] mt-6" 
                  type="submit"
                  disabled={isLoading}
                >
                  {isLoading ? "Processando..." : "Cadastrar"}
                </button>
              </form>
            </Step>

            {/* STEP 2: Confirm Account */}
            <Step canGoBack={true}>
              <div className="text-center mb-8">
                <h1 className="text-3xl font-extrabold text-gray-800 mb-2">DataLab <span className="text-orange-600">App</span></h1>
                <h2 className="text-gray-500 text-lg font-medium">Confirmar Conta</h2>
                <p className="text-gray-400 text-sm mt-2">
                  Digite o código de 6 dígitos enviado para <b>{email}</b>.
                </p>
              </div>
              <form onSubmit={handleConfirm} className="space-y-4">
                <div className="space-y-1">
                  <label htmlFor="inputCode" className="block text-sm font-semibold text-gray-700 ml-1">Código de Confirmação</label>
                  <input 
                    type="text" 
                    id="inputCode" 
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all bg-gray-50 focus:bg-white text-center tracking-widest text-lg" 
                    placeholder="000000" 
                    required 
                    autoFocus
                    maxLength={6}
                    autoComplete="one-time-code"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                  />
                </div>

                <div className="flex flex-col gap-4 mt-6">
                  <button 
                    className="w-full bg-orange-600 hover:bg-orange-700 disabled:opacity-70 disabled:cursor-wait text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-md hover:shadow-lg active:scale-[0.98]" 
                    type="submit"
                    disabled={isLoading}
                  >
                    {isLoading ? "Processando..." : "Confirmar Conta"}
                  </button>

                  <TimedButton
                      cooldown={120}
                      disabled={false}
                      onClick={handleResendCode}
                      textWhenClicked="Reenviar Código"
                      textWhenNoClicked="Reenviar Código"
                      className="bg-gray-100 hover:bg-gray-200 text-gray-600 hover:shadow-sm" 
                  />
                </div>
              </form>
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
