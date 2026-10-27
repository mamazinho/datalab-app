import type { ReactNode } from 'react';
import axios from 'axios';
import { useMe } from '../hooks/use-me';
import { LoadingPiece } from '../components/Feedback/Loadings/loading';
import { ServerErrorComponent } from '../components/Feedback/ErrorBoundaries/server-error';

// Telling a failed /me apart from a user without a company keeps a bad token out of /onboarding
// and an API outage from becoming a broken onboarding screen
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
