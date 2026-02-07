import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ForgotPasswordContainer } from './forgot-password.style';
import { DatalabAPI } from '../../services/datalab-api';

export const ForgotPassword: React.FC = () => {
    const [email, setEmail] = useState('');
    const [timer, setTimer] = useState(0);
    const [hasSent, setHasSent] = useState(false);

    useEffect(() => {
        let interval: number;
        if (timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [timer]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await DatalabAPI.UsersResource.forgotPassword({ user_email: email })
            alert("Um link de recuperação foi enviado para o seu email.");
            setTimer(120);
            setHasSent(true);
        } catch (error) {
            console.log("Falha ao enviar o link de recuperação. Tente novamente.", error);
            return;
        }
    };
    
    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };  

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

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-1">
                            <label htmlFor="inputEmail" className="block text-sm font-semibold text-gray-700 ml-1">Email</label>
                            <input
                                type="email"
                                id="inputEmail"
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all bg-gray-50 focus:bg-white"
                                placeholder="seu@email.com"
                                required
                                autoFocus
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <button
                            className="w-full bg-orange-600 hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-orange-600 disabled:shadow-none disabled:active:scale-100 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-md hover:shadow-lg active:scale-[0.98] mt-4"
                            type="submit"
                            disabled={timer > 0}
                        >
                            {timer > 0 ? `Reenviar em ${formatTime(timer)}` : (hasSent ? "Reenviar Link" : "Enviar Link")}
                        </button>

                        <div className="text-center pt-4 border-t border-gray-100 mt-6 flex flex-col gap-2">
                            <Link to="/login" className="text-gray-500 hover:text-orange-600 font-medium transition-colors hover:underline">Voltar para Login</Link>
                        </div>
                    </form>
                </div>
            </div>
        </ForgotPasswordContainer>
    );
};
