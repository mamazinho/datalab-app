import { axiosCompanyInstance } from "./axios";
import type { UUID7 } from "../../types/ids";

export interface IChatMember {
  name: string;
  avatar_url: string | null;
}

export interface IChatUsage {
  input_tokens: number;
  output_tokens: number;
  requests: number;
}

export interface IRetrieveChat {
  id: UUID7;
  company_id: UUID7;
  title: string | null;
  is_private: boolean;
  archived: boolean;
  created_by_membership_id: UUID7 | null;
  created_by: IChatMember | null;
  created_at: string;
  updated_at: string;
}

export interface IRetrieveChatDetail extends IRetrieveChat {
  usage: IChatUsage;
}

export interface ICreateChat {
  title: string;
  is_private: boolean;
}

export type ChatUsageOrigin = 'supervisor' | 'specialist' | 'complexity_classifier' | 'answer_rewriter';

export interface IChatUsageByMember extends IChatUsage {
  membership_id: UUID7 | null;
  name: string | null;
  avatar_url: string | null;
}

export interface IChatUsageByChat extends IChatUsage {
  chat_id: UUID7;
  title: string | null;
  is_private: boolean;
  archived: boolean;
  deleted: boolean;
  created_by: IChatMember | null;
}

export interface IChatUsageByOrigin extends IChatUsage {
  origin: ChatUsageOrigin;
}

export interface IChatUsageByModel extends IChatUsage {
  model: string | null;
  provider: string | null;
}

export interface IChatUsageReport {
  start: string | null;
  end: string | null;
  totals: IChatUsage;
  by_member: IChatUsageByMember[];
  by_chat: IChatUsageByChat[];
  by_origin: IChatUsageByOrigin[];
  by_model: IChatUsageByModel[];
}

export const ChatsResource = {
  async getAllChats({ archived }: { archived: boolean }): Promise<IRetrieveChat[]> {
    const response = await axiosCompanyInstance.get('chats/', { params: archived ? { archived } : {} });
    return response.data as IRetrieveChat[];
  },

  async getChat(chatId: UUID7): Promise<IRetrieveChatDetail> {
    const response = await axiosCompanyInstance.get(`chats/${chatId}/`);
    return response.data as IRetrieveChatDetail;
  },

  async createChat(payload: ICreateChat): Promise<IRetrieveChat> {
    const response = await axiosCompanyInstance.post('chats/', payload);
    return response.data as IRetrieveChat;
  },

  async archiveChat(chatId: UUID7, archived: boolean): Promise<IRetrieveChat> {
    const response = await axiosCompanyInstance.patch(`chats/${chatId}/`, { archived });
    return response.data as IRetrieveChat;
  },

  async deleteChat(chatId: UUID7): Promise<void> {
    await axiosCompanyInstance.delete(`chats/${chatId}/`);
  },

  async getUsageReport(period: { start?: string; end?: string }): Promise<IChatUsageReport> {
    const response = await axiosCompanyInstance.get('chats/usage/', { params: period });
    return response.data as IChatUsageReport;
  },
}
