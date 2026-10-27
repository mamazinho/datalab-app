import { useQuery } from '@tanstack/react-query';
import { meQuery } from '../queries';
import { useAuthContext } from '../contexts/auth';

export const useMe = () => {
  const { accessToken } = useAuthContext();

  return useQuery({
    ...meQuery,
    enabled: !!accessToken,
  });
};

// Holds the route guards while the first user load runs, so redirects do not flash
export const useIsAuthLoading = (): boolean => {
  const { accessToken } = useAuthContext();
  const { isLoading } = useMe();

  return !!accessToken && isLoading;
};
