import { Suspense, type ReactNode } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { QueryErrorResetBoundary } from '@tanstack/react-query';
import { ServerErrorComponent } from '../Feedback/ErrorBoundaries/server-error';
import { LoadingPiece } from '../Feedback/Loadings/loading';

interface IQueryBoundaryProps {
  children: ReactNode;
  loadingFallback?: ReactNode;
}

/**
 * Padrão oficial de leitura do app: envolve componentes com useSuspenseQuery
 * em Suspense + ErrorBoundary. O "Tentar novamente" do fallback de erro
 * reseta as queries com falha e refaz o fetch.
 */
export const QueryBoundary = ({ children, loadingFallback }: IQueryBoundaryProps) => (
  <QueryErrorResetBoundary>
    {({ reset }) => (
      <ErrorBoundary FallbackComponent={ServerErrorComponent} onReset={reset}>
        <Suspense fallback={loadingFallback ?? <LoadingPiece />}>
          {children}
        </Suspense>
      </ErrorBoundary>
    )}
  </QueryErrorResetBoundary>
);
