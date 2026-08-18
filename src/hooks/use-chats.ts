import { useSuspenseQuery } from '@tanstack/react-query';
import { chatsQuery } from '../queries';

export const useChats = () => useSuspenseQuery(chatsQuery);
