import type { PageLoad, PageLoadEvent } from './$types';

export const load: PageLoad = async (event: PageLoadEvent) => {
  const getAllChatMessages = async () => {
    const res = await event.fetch(`/chats/${event.params.chatId}/messages`);
    if (!res.ok || (res.body === undefined || res.body === null)) {
      throw new Error('Server: Não foi possível obter as mensagens do chat.');
    }
    return res.body;
  }

	return {
		loadInitialMessages: getAllChatMessages,
	};
};