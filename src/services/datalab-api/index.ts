import axios from "axios";

const axionsInstance = axios.create({
  baseURL: import.meta.env.VITE_DATALAB_API_URL,
  headers: {
    xsrfCookieName: 'csrftoken',
    xsrfHeaderName: 'X-CSRFToken',
    'Content-Type': 'application/json',
  },
});

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

export const DatalabAPI = {
  async getAllChats(): Promise<IRetrieveChat[]> {
    const response = await axionsInstance.get('v1/chats')
    return response.data as IRetrieveChat[];
  },

  async createChat(payload: ICreateChat): Promise<IRetrieveChat> {
    const response = await axionsInstance.post('v1/chats', payload);
    return response.data as IRetrieveChat;
  }
};