import { axionsInstance } from "./axios";

export interface IRetrieveChat {
  id: number;
  user_id: number;
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
    const response = await axionsInstance.get('v1/chats/')
    return response.data as IRetrieveChat[];
  },

  async createChat(payload: ICreateChat): Promise<IRetrieveChat> {
    const response = await axionsInstance.post('v1/chats/', payload);
    return response.data as IRetrieveChat;
  }
}