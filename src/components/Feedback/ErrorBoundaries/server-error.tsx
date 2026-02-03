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
      <div className="text-center p-3 text-muted">
         <small>Conteúdo indisponível ({status})</small>
      </div>
    );
  }

  return (
    <div className="alert alert-danger shadow-sm m-3" role="alert">
      <h4 className="alert-heading h5">Falha no Servidor</h4>
      <p className="mb-2">
        Não foi possível carregar as informações. O servidor encontrou um problema momentâneo.
      </p>
      <hr />
      <div className="d-flex justify-content-between align-items-center">
        <small className="font-monospace text-muted" style={{ fontSize: '0.8em' }}>
          {(error as Error)?.message || "Erro desconhecido"}
        </small>
        <button 
          onClick={resetErrorBoundary} 
          className="btn btn-sm btn-outline-danger"
        >
          Tentar novamente
        </button>
      </div>
    </div>
  );
}