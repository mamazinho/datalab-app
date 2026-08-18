import { useSuspenseQuery } from '@tanstack/react-query';
import { invitesQuery } from '../queries';

export const useInvites = () => useSuspenseQuery(invitesQuery);
