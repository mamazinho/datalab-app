import { useSuspenseQuery } from '@tanstack/react-query';
import { integrationsQuery } from '../queries';

export const useIntegrations = () => useSuspenseQuery(integrationsQuery);
