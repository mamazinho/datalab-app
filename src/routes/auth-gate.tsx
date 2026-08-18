import type { ReactNode } from 'react';
import axios from 'axios';
import { useMe } from '../hooks/use-me';
import { LoadingPiece } from '../components/Feedback/Loadings/loading';
import { ServerErrorComponent } from '../components/Feedback/ErrorBoundaries/server-error';

/**
 * Resolve o /me antes de liberar a área autenticada. Distinguir "me falhou" de
 * "me carregou sem empresa" é o que impede um token inválido de cair em /onboarding
 * em vez de /login, e uma API fora do ar de virar uma tela de onboarding quebrada.
 *
 * - sucesso → children
 * - erro de servidor/rede → tela de erro com "Tentar novamente" (refaz o /me)
 * - carregando, ou erro de auth (401/403) enquanto o logout redireciona → spinner
 */
export const AuthGate = ({ children }: { children: ReactNode }) => {
  const { data: me, error, refetch } = useMe();

  if (me) return <>{children}</>;

  const isAuthError =
    axios.isAxiosError(error) &&
    (error.response?.status === 401 || error.response?.status === 403);

  if (error && !isAuthError) {
    return <ServerErrorComponent error={error} resetErrorBoundary={() => void refetch()} />;
  }

  return <LoadingPiece />;
};
