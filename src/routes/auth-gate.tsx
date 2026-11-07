import type { ReactNode } from 'react';
import { useMe } from '../hooks/use-me';
import { LoadingPiece } from '../components/Feedback/Loadings/loading';
import { ServerErrorComponent } from '../components/Feedback/ErrorBoundaries/server-error';
import { ApiError } from '../utils/api-error';

// Telling a failed /me apart from a user without a company keeps a bad token out of /onboarding
// and an API outage from becoming a broken onboarding screen
export const AuthGate = ({ children }: { children: ReactNode }) => {
  const { data: me, error, refetch } = useMe();

  if (me) return <>{children}</>;

  const { status } = ApiError.from(error);
  const isAuthError = status === 401 || status === 403;

  if (error && !isAuthError) {
    return <ServerErrorComponent error={error} resetErrorBoundary={() => void refetch()} />;
  }

  return <LoadingPiece />;
};
