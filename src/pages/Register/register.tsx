import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { RegisterContainer } from './register.style';

export const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = (e: React.SubmitEvent) => {
    e.preventDefault();
    console.log("Register submitted:", { name, email, password, confirmPassword });
  };

  return (
    <RegisterContainer>
      <div className="flex items-center justify-center min-h-[80vh] p-4">
        <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold text-gray-800 mb-2">DataLab <span className="text-orange-600">App</span></h1>
            <h2 className="text-gray-500 text-lg font-medium">Crie sua conta</h2>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
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
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            <button className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-md hover:shadow-lg active:scale-[0.98] mt-6" type="submit">Cadastrar</button>
            
            <div className="text-center pt-4 border-t border-gray-100 mt-6">
              <Link to="/login" className="text-orange-600 hover:text-orange-800 font-medium transition-colors hover:underline">Já possui conta? Faça Login</Link>
            </div>
          </form>
        </div>
      </div>
    </RegisterContainer>
  );
};
