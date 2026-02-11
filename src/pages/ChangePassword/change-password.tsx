import React, { useActionState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ChangePasswordContainer } from './change-password.style';
import { toast } from 'react-toastify';
import { changePasswordAction } from './actions';
import { INITIAL_ACTION_STATE, type ActionState } from '../../types/actions';
import { PasswordInput } from '../../components/UI/Inputs/password-input';


export const ChangePassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [state, formAction, isPending] = useActionState(changePasswordAction, INITIAL_ACTION_STATE);

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
    handleChangePasswordResult(state);
  }, [state, handleChangePasswordResult]);

  return (
    <ChangePasswordContainer>
      <div className="flex items-center justify-center min-h-[80vh] p-4">
        <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold text-gray-800 mb-2">DataLab <span className="text-orange-600">App</span></h1>
            <h2 className="text-gray-500 text-lg font-medium">Redefinir Senha</h2>
            <p className="text-gray-400 text-sm mt-2">Crie uma nova senha para sua conta.</p>
          </div>
          
          <form action={formAction} className="space-y-5">
            <input type="hidden" name="email" value={email} />
            <input type="hidden" name="code" value={code} />
            
            <fieldset disabled={isPending} className="space-y-5">
              <div className="space-y-1">
                <label htmlFor="inputPassword" className="block text-sm font-semibold text-gray-700 ml-1">Nova Senha</label>
                <PasswordInput
                    id="inputPassword" 
                    name="password"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all bg-gray-50 focus:bg-white disabled:bg-gray-100 disabled:text-gray-500 pr-12" 
                    required 
                    autoFocus
                    autoComplete="new-password"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="inputConfirmPassword" className="block text-sm font-semibold text-gray-700 ml-1">Confirmar Senha</label>
                <PasswordInput
                    id="inputConfirmPassword" 
                    name="confirmPassword"
                    className={`w-full px-4 py-3 rounded-xl border ${state.error ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-200 focus:border-orange-500 focus:ring-orange-500/20'} focus:ring-2 outline-none transition-all bg-gray-50 focus:bg-white disabled:bg-gray-100 disabled:text-gray-500 pr-12`}
                    required 
                    autoComplete="new-password"
                />
                {state.error && <p className="text-red-500 text-xs ml-1 mt-1">{state.error}</p>}
              </div>

              <button className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-md hover:shadow-lg active:scale-[0.98] mt-4 disabled:opacity-70 disabled:cursor-not-allowed" type="submit">
                  {isPending ? 'Alterando...' : 'Alterar Senha'}
              </button>
            </fieldset>
            
            <div className="text-center pt-4 border-t border-gray-100 mt-6">
               <Link to="/login" className="text-gray-500 hover:text-orange-600 font-medium transition-colors hover:underline">Cancelar</Link>
            </div>
          </form>
        </div>
      </div>
    </ChangePasswordContainer>
  );
};
