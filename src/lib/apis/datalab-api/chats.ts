import type { ICreateChat, IRetrieveChat } from "$lib/types/message";
import { axiosPrivateInstance } from "./axios";


export const ChatsResource = {
  async getChatMessages(chatId: number): Promise<ReadableStream<Uint8Array>> {
    const response = await axiosPrivateInstance.get(
      `chats/${chatId}/messages/`,
      { 
        adapter: 'fetch',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        responseType: 'stream'
      },
    )
    return response.data;
  },
  async sendMessage(chatId: number, message: string): Promise<ReadableStream<Uint8Array>> {
    const response = await axiosPrivateInstance.post(
      `chats/${chatId}/messages/`,
      { prompt: message },
      {
        adapter: 'fetch',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/x-www-form-urlencoded' },
        responseType: 'stream'
      }
    );

    return response.data;
  },
  async getAllChats(): Promise<IRetrieveChat[]> {
    const response = await axiosPrivateInstance.get('chats/')
    return response.data as IRetrieveChat[];
  },

  async createChat(payload: ICreateChat): Promise<IRetrieveChat> {
    const response = await axiosPrivateInstance.post('chats/', payload);
    return response.data as IRetrieveChat;
  }
}