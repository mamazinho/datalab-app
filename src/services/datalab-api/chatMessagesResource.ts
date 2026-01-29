import { axiosInstance } from "./axios";

export const ChatMessagesResource = {
  async getChatMessages(chatId: number): Promise<ReadableStream<Uint8Array>> {
    const response = await axiosInstance.get(
      `v1/chats/${chatId}/messages/`,
      { 
        adapter: 'fetch',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        responseType: 'stream'
      },
    )
    return response.data;
  },
  async sendMessage(chatId: number, message: string): Promise<ReadableStream<Uint8Array>> {
    const formData = new FormData();
    formData.append('prompt', message);
    const response = await axiosInstance.post(
      `v1/chats/${chatId}/messages/`,
      formData,
      {
        adapter: 'fetch',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        responseType: 'stream'
      }
    );

    return response.data;
  }
}
