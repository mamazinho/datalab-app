import React, { useCallback, useEffect, useActionState } from 'react';
import { Link } from 'react-router-dom';
import { ForgotPasswordContainer } from './forgot-password.style';
import { TimedButton } from '../../components/UI/Buttons/timed-button';
import { forgotPasswordAction } from './actions';
import { INITIAL_ACTION_STATE, type ActionState } from '../../types/actions';

export const ForgotPassword: React.FC = () => {
    const [forgotPasswordState, formAction, isPending] = useActionState(forgotPasswordAction, INITIAL_ACTION_STATE);

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
            <div className="flex items-center justify-center min-h-[80vh] p-4">
                <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-extrabold text-gray-800 mb-2">DataLab <span className="text-orange-600">App</span></h1>
                        <h2 className="text-gray-500 text-lg font-medium">Recuperar Senha</h2>
                        <p className="text-gray-400 text-sm mt-2">
                            Informe seu email para receber um link de recuperação.
                        </p>
                    </div>

                    <form action={formAction} className="space-y-5">
                        <fieldset disabled={isPending} className="space-y-5">
                            <div className="space-y-1">
                                <label htmlFor="inputEmail" className="block text-sm font-semibold text-gray-700 ml-1">Email</label>
                                <input
                                    type="email"
                                    id="inputEmail"
                                    name="email"
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all bg-gray-50 focus:bg-white disabled:bg-gray-100 disabled:text-gray-500"
                                    placeholder="seu@email.com"
                                    required
                                    autoFocus
                                    autoComplete="email"
                                />
                            </div>

                            <TimedButton
                                cooldown={120}
                                disabled={isPending}
                                type="submit"
                                textWhenClicked="Reenviar Link"
                                textWhenNoClicked="Enviar Link"
                            />
                        </fieldset>

                        <div className="text-center pt-4 border-t border-gray-100 mt-6 flex flex-col gap-2">
                            <Link to="/login" className="text-gray-500 hover:text-orange-600 font-medium transition-colors hover:underline">Voltar para Login</Link>
                        </div>
                    </form>
                </div>
            </div>
        </ForgotPasswordContainer>
    );
};
