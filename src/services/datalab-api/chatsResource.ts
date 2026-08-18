import { axiosCompanyInstance } from "./axios";
import type { UUID } from "../../types/ids";

export interface IRetrieveChat {
  id: UUID;
  user_id: UUID;
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

  async getChat(chatId: UUID): Promise<IRetrieveChat> {
    const response = await axiosCompanyInstance.get(`chats/${chatId}/`);
    return response.data as IRetrieveChat;
  },

  async createChat(payload: ICreateChat): Promise<IRetrieveChat> {
    const response = await axiosCompanyInstance.post('chats/', payload);
    return response.data as IRetrieveChat;
  }
}