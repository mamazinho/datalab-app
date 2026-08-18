import { useSuspenseQuery } from '@tanstack/react-query';
import { agentsQuery } from '../queries';

export const useAgents = () => useSuspenseQuery(agentsQuery);
