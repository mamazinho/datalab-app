import { useSuspenseQuery } from '@tanstack/react-query';
import { chatMessagesQuery } from '../queries';
import type { UUID } from '../types/ids';

export const useChatMessages = (chatId: UUID) => useSuspenseQuery(chatMessagesQuery(chatId));
