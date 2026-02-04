import { useEffect, useRef } from "react";
import type { FallbackProps } from "react-error-boundary";
import { toast, type Id } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { isAxiosError, AxiosError } from 'axios';

export const ServerErrorComponent = ({ error, resetErrorBoundary }: FallbackProps) => {
  const toastId = useRef<Id | null>(null);

  const getStatus = (err: AxiosError) => {
    if (isAxiosError(err)) {
      return err.response?.status || 500;
    }
  };
  const status = getStatus(error as AxiosError) || 500;

  const isClientError = status >= 400 && status < 500; 

  useEffect(() => {
    if (isClientError) {
      const message = (error as Error)?.message || "Erro na requisição";
      if (toastId.current === null || !toast.isActive(toastId.current)) {
        toastId.current = toast.error(`Atenção: ${message}`, {
          toastId: `error-${status}`,
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "colored",
        });
      }
    }
  }, [isClientError, error, status]);

  if (isClientError) {
    return (
      <div className="text-center p-4 text-gray-400 opacity-60">
         <span className="text-xs font-mono">Conteúdo indisponível ({status})</span>
      </div>
    );
  }

  return (
    <div className="bg-red-50 border-l-4 border-red-500 rounded p-4 m-4 shadow-sm" role="alert">
      <div className="flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <h4 className="text-lg font-semibold text-red-700">Falha no Servidor</h4>
      </div>
      
      <p className="mt-2 text-sm text-red-600">
        Não foi possível carregar as informações. O servidor encontrou um problema momentâneo.
      </p>
      
      <div className="mt-4 pt-3 border-t border-red-100 flex justify-between items-center">
        <code className="text-xs text-red-400 bg-red-50 px-1 py-0.5 rounded">
          {(error as Error)?.message || "Erro desconhecido"}
        </code>
        
        <button 
          onClick={resetErrorBoundary} 
          className="px-4 py-2 text-sm font-medium text-orange-600 bg-white border border-gray-200 rounded-lg hover:bg-orange-50 hover:border-orange-200 hover:text-orange-700 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
        >
          Tentar novamente
        </button>
      </div>
    </div>
  );
}