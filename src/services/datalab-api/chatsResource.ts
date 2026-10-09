import { axiosCompanyInstance } from "./axios";
import type { UUID7 } from "../../types/ids";

export interface IRetrieveChat {
  id: UUID7;
  user_id: UUID7;
  title: string;
  input_tokens: number;
  output_tokens: number;
  number_of_requests: number;
  created_at: Date;
  updated_at: Date;
}

export interface ICreateChat {
  title: string;
}

export const ChatsResource = {
  async getAllChats(): Promise<IRetrieveChat[]> {
    const response = await axiosCompanyInstance.get('chats/')
    return response.data as IRetrieveChat[];
  },

  async getChat(chatId: UUID7): Promise<IRetrieveChat> {
    const response = await axiosCompanyInstance.get(`chats/${chatId}/`);
    return response.data as IRetrieveChat;
  },

  async createChat(payload: ICreateChat): Promise<IRetrieveChat> {
    const response = await axiosCompanyInstance.post('chats/', payload);
    return response.data as IRetrieveChat;
  }
}