import { useSuspenseQuery } from '@tanstack/react-query';
import { chatMessagesQuery } from '../queries';
import type { UUID7 } from '../types/ids';

export const useChatMessages = (chatId: UUID7) => useSuspenseQuery(chatMessagesQuery(chatId));
