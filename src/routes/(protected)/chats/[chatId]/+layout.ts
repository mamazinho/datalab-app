import type { LayoutLoad, LayoutLoadEvent } from './$types';
import { DatalabAPI } from '$home/lib/apis/datalab-api';
import { callAndHandleError } from '$home/lib/apis/datalab-api/handler';

export const ssr = false;

export const load: LayoutLoad = async ({ params }: LayoutLoadEvent) => {
  const chatData = await callAndHandleError(() => DatalabAPI.ChatsResource.getChat(Number(params.chatId)));
  return { chatData };
};
