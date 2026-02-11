import React from 'react';

interface IRegisterFormProps extends React.FormHTMLAttributes<HTMLFormElement> {
    isPending: boolean;
}

export const RegisterForm: React.FC<IRegisterFormProps> = ({ isPending, ...props }) => {
    return (
        <>
            <div className="text-center mb-8">
                <h1 className="text-3xl font-extrabold text-gray-800 mb-2">DataLab <span className="text-orange-600">App</span></h1>
                <h2 className="text-gray-500 text-lg font-medium">Crie sua conta</h2>
            </div>
            <form className="space-y-4" {...props}>
                <fieldset disabled={isPending} className="space-y-4 contents">
                    <div className="space-y-1">
                        <label htmlFor="inputName" className="block text-sm font-semibold text-gray-700 ml-1">Nome Completo</label>
                        <input
                            type="text"
                            id="inputName"
                            name="name"
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all bg-gray-50 focus:bg-white disabled:bg-gray-100 disabled:text-gray-500"
                            placeholder="Seu nome"
                            required
                            autoFocus
                            autoComplete="name"
                        />
                    </div>

                    <div className="space-y-1">
                        <label htmlFor="inputEmail" className="block text-sm font-semibold text-gray-700 ml-1">Email</label>
                        <input
                            type="email"
                            id="inputEmail"
                            name="email"
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all bg-gray-50 focus:bg-white disabled:bg-gray-100 disabled:text-gray-500"
                            placeholder="seu@email.com"
                            required
                            autoComplete="email"
                        />
                    </div>

                    <div className="space-y-1">
                        <label htmlFor="inputPassword" className="block text-sm font-semibold text-gray-700 ml-1">Senha</label>
                        <input
                            type="password"
                            id="inputPassword"
                            name="password"
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all bg-gray-50 focus:bg-white disabled:bg-gray-100 disabled:text-gray-500"
                            placeholder="Sua senha"
                            required
                            autoComplete="new-password"
                        />
                    </div>

                    <div className="space-y-1">
                        <label htmlFor="inputConfirmPassword" className="block text-sm font-semibold text-gray-700 ml-1">Confirmar Senha</label>
                        <input
                            type="password"
                            id="inputConfirmPassword"
                            name="confirmPassword"
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all bg-gray-50 focus:bg-white disabled:bg-gray-100 disabled:text-gray-500"
                            placeholder="Confirme sua senha"
                            required
                            autoComplete="new-password"
                        />
                    </div>

                    <button
                        className="w-full bg-orange-600 hover:bg-orange-700 disabled:opacity-70 disabled:cursor-wait text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-md hover:shadow-lg active:scale-[0.98] mt-6"
                        type="submit"
                    >
                        {isPending ? "Processando..." : "Cadastrar"}
                    </button>
                </fieldset>
            </form>
        </>
    );
};
