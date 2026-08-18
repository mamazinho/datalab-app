import { useSuspenseQuery } from '@tanstack/react-query';
import { chatQuery } from '../queries';
import type { UUID } from '../types/ids';

export const useChat = (chatId: UUID) => useSuspenseQuery(chatQuery(chatId));
