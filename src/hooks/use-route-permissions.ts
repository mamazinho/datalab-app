import { useSuspenseQuery } from '@tanstack/react-query';
import { routePermissionsQuery } from '../queries';

export const useRoutePermissions = () => useSuspenseQuery(routePermissionsQuery);
