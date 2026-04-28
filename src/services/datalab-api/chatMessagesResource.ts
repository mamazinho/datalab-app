import { axiosCompanyInstance } from "./axios";

export const ChatMessagesResource = {
  async getChatMessages(chatId: number): Promise<ReadableStream<Uint8Array>> {
    const response = await axiosCompanyInstance.get(
      `chats/${chatId}/messages/`,
      { 
        adapter: 'fetch',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        responseType: 'stream'
      },
    )
    return response.data;
  },
  async sendMessage(chatId: number, message: string, modelName: string): Promise<ReadableStream<Uint8Array>> {
    const response = await axiosCompanyInstance.post(
      `chats/${chatId}/messages/`,
      {'prompt': message.trim(), 'model_name': modelName},
      {
        adapter: 'fetch',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/x-www-form-urlencoded' },
        responseType: 'stream'
      }
    );

    return response.data;
  }
}
