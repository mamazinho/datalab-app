import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ChangePasswordContainer } from './change-password.style';
import { DatalabAPI } from '../../services/datalab-api';
import { toast } from 'react-toastify';

export const ChangePassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const email = searchParams.get('email');
  const code = searchParams.get('code');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Frontend validation
    if (password !== confirmPassword) {
        setError('As senhas não coincidem.');
        return;
    }

    if (!email || !code) {
        setError('Link inválido (email ou código ausente).');
        return;
    }

    try {
        await DatalabAPI.UsersResource.changePassword({
            user_email: email,
            code: code,
            new_password: password
        });
        toast.success("Senha alterada com sucesso!");
        setTimeout(() => {
            navigate('/login');
        }, 3000);
    } catch (err) {
        console.error("Change password error:", err);
        setError('Erro ao alterar senha. O link pode ter expirado.');
    }
  };

  return (
    <ChangePasswordContainer>
      <div className="flex items-center justify-center min-h-[80vh] p-4">
        <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold text-gray-800 mb-2">DataLab <span className="text-orange-600">App</span></h1>
            <h2 className="text-gray-500 text-lg font-medium">Redefinir Senha</h2>
            <p className="text-gray-400 text-sm mt-2">Crie uma nova senha para sua conta.</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1">
              <label htmlFor="inputPassword" className="block text-sm font-semibold text-gray-700 ml-1">Nova Senha</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"}
                  id="inputPassword" 
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all bg-gray-50 focus:bg-white pr-12" 
                  required 
                  autoFocus
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label htmlFor="inputConfirmPassword" className="block text-sm font-semibold text-gray-700 ml-1">Confirmar Senha</label>
              <div className="relative">
                <input 
                  type={showConfirmPassword ? "text" : "password"} 
                  id="inputConfirmPassword" 
                  className={`w-full px-4 py-3 rounded-xl border ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-200 focus:border-orange-500 focus:ring-orange-500/20'} focus:ring-2 outline-none transition-all bg-gray-50 focus:bg-white pr-12`}
                  required 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
                >
                  {showConfirmPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
              </div>
              {error && <p className="text-red-500 text-xs ml-1 mt-1">{error}</p>}
            </div>

            <button className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-md hover:shadow-lg active:scale-[0.98] mt-4" type="submit">
                Alterar Senha
            </button>
            
            <div className="text-center pt-4 border-t border-gray-100 mt-6">
               <Link to="/login" className="text-gray-500 hover:text-orange-600 font-medium transition-colors hover:underline">Cancelar</Link>
            </div>
          </form>
        </div>
      </div>
    </ChangePasswordContainer>
  );
};
