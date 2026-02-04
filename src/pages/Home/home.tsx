import React from 'react';
import { Link } from 'react-router-dom';
import { HomeContainer } from './home.style';
import { useAuthContext } from '../../contexts/auth';

export const Home: React.FC = () => {
  const { logout } = useAuthContext();

  return (
    <HomeContainer>
      <div className="relative min-h-[80vh] w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="absolute top-0 right-4">
            <button className="text-gray-500 hover:text-orange-600 font-medium transition-colors px-4 py-2 rounded-lg hover:bg-orange-50" onClick={logout}>Logout</button>
        </div>
        
        <div className="text-center max-w-3xl mx-auto mb-16 mt-8">
          <div className="mb-8">
            <div className="inline-block p-4 rounded-full bg-orange-50 mb-4 animate-bounce-slow">
               <span className="text-4xl">🚀</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-4">
              DataLab <span className="text-orange-600">App</span>
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              Bem-vindo ao DataLab! Escolha uma das opções abaixo para começar a explorar nossos recursos de inteligência.
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-orange-200 transition-all duration-300 group hover:-translate-y-1">
            <div className="p-8 flex flex-col h-full">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform">
                  🤖
              </div>
              <h5 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-orange-600 transition-colors">Chat AI</h5>
              <p className="text-gray-600 mb-6 grow">
                Converse com nossa inteligência artificial e tire suas dúvidas em tempo real.
              </p>
              <Link to="/chats" className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-orange-600 hover:bg-orange-700 transition-colors shadow-sm hover:shadow-md">
                Acessar Chats
              </Link>
            </div>
          </div>
        </div>
      </div>
    </HomeContainer>
  );
};
