import React, { useState } from 'react';
import { TimedButton } from '../../../components/UI/Buttons/timed-button';

interface IConfirmAccountFormProps {
    onSubmit: (code: string) => void;
    isLoading: boolean;
    email: string;
    onResendCode: () => Promise<void>;
}

export const ConfirmAccountForm: React.FC<IConfirmAccountFormProps> = ({
    onSubmit,
    isLoading,
    email,
    onResendCode
}) => {
    const [code, setCode] = useState('');

    const handleSubmit = (e: React.SubmitEvent) => {
        e.preventDefault();
        onSubmit(code);
    };

    return (
        <>
            <div className="text-center mb-8">
                <h1 className="text-3xl font-extrabold text-gray-800 mb-2">DataLab <span className="text-orange-600">App</span></h1>
                <h2 className="text-gray-500 text-lg font-medium">Confirmar Conta</h2>
                <p className="text-gray-400 text-sm mt-2">
                    Digite o código de 6 dígitos enviado para <b>{email}</b>.
                </p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
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
                        onClick={onResendCode}
                        textWhenClicked="Reenviar Código"
                        textWhenNoClicked="Reenviar Código"
                        className="bg-gray-100 hover:bg-gray-200 text-gray-600 hover:shadow-sm"
                    />
                </div>
            </form>
        </>
    );
};
