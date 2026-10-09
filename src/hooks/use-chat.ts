import { useSuspenseQuery } from '@tanstack/react-query';
import { chatQuery } from '../queries';
import type { UUID7 } from '../types/ids';

export const useChat = (chatId: UUID7) => useSuspenseQuery(chatQuery(chatId));
