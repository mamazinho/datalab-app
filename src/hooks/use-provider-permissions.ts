import { useSuspenseQuery } from '@tanstack/react-query';
import { providerPermissionsQuery } from '../queries';

export const useProviderPermissions = () => useSuspenseQuery(providerPermissionsQuery);
