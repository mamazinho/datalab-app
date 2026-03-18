import { useEffect, useRef } from "react";
import type { FallbackProps } from "react-error-boundary";
import { toast, type Id } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { isAxiosError, AxiosError } from 'axios';
import {
  AlertIcon,
  ClientErrorCode,
  ClientErrorInfo,
  ErrorMessageCode,
  Footer,
  Header,
  RetryButton,
  ServerErrorBox,
  Text,
  Title,
} from './server-error.style';

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
      <ClientErrorInfo>
         <ClientErrorCode>Conteúdo indisponível ({status})</ClientErrorCode>
      </ClientErrorInfo>
    );
  }

  return (
    <ServerErrorBox role="alert">
      <Header>
        <AlertIcon xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </AlertIcon>
        <Title>Falha no Servidor</Title>
      </Header>
      
      <Text>
        Não foi possível carregar as informações. O servidor encontrou um problema momentâneo.
      </Text>
      
      <Footer>
        <ErrorMessageCode>
          {(error as Error)?.message || "Erro desconhecido"}
        </ErrorMessageCode>
        
        <RetryButton 
          onClick={resetErrorBoundary} 
        >
          Tentar novamente
        </RetryButton>
      </Footer>
    </ServerErrorBox>
  );
}