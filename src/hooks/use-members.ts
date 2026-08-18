import { useSuspenseQuery } from '@tanstack/react-query';
import { membersQuery } from '../queries';

export const useMembers = () => useSuspenseQuery(membersQuery);
