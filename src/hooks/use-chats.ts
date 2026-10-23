import { useSuspenseQuery } from '@tanstack/react-query';
import { chatsQuery } from '../queries';

export const useChats = (includeArchived: boolean) => useSuspenseQuery(chatsQuery(includeArchived));
