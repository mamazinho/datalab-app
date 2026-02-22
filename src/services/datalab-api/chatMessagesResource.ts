import { axiosPrivateInstance } from "./axios";

export const ChatMessagesResource = {
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
      {'prompt': message.trim()},
      {
        adapter: 'fetch',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/x-www-form-urlencoded' },
        responseType: 'stream'
      }
    );

    return response.data;
  }
}
