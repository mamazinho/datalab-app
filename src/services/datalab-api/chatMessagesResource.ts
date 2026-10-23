import { axiosCompanyInstance } from "./axios";
import type { IChatFileRef } from "./chatFilesResource";
import type { IChatMember } from "./chatsResource";
import type { UUID7 } from "../../types/ids";

export type ChatChannel = 'main' | 'thread';
export type ChatAuthor = 'user' | 'supervisor' | 'specialist';
export type ChatMessageType = 'chat' | 'agent_event' | 'clarification' | 'file';

export interface IChatMessageRead {
  id: UUID7;
  author: ChatAuthor;
  agent_key: string | null;
  message_type: ChatMessageType;
  thread_id: string | null;
  content: string | null;
  created_at: string;
  channel: ChatChannel;
  tool_call_id?: string | null;
  options?: string[] | null;
  files?: IChatFileRef[] | null;
  sender: IChatMember | null;
}

export type IChatStreamEvent =
  | { type: 'text_delta'; channel: 'main'; author?: ChatAuthor; content: string }
  | { type: 'agent_event'; channel: 'thread'; thread_id: string; author: 'supervisor' | 'specialist'; agent_key: string; content: string }
  | { type: 'clarification'; channel?: ChatChannel; question: string; options?: string[]; tool_call_id: string }
  | { type: 'file'; channel?: ChatChannel; author?: ChatAuthor; files?: IChatFileRef[] }
  | { type: 'error'; content?: string }
  | { type: 'done' };

export interface IUserPrompt {
  prompt: string;
  answer_to_tool_call_id?: string;
  file_ids?: UUID7[];
}

export const ChatMessagesResource = {
  async getChatMessages(chatId: UUID7): Promise<IChatMessageRead[]> {
    const response = await axiosCompanyInstance.get(`chats/${chatId}/messages/`);
    return response.data as IChatMessageRead[];
  },
  async sendMessage(chatId: UUID7, payload: IUserPrompt): Promise<ReadableStream<Uint8Array>> {
    const response = await axiosCompanyInstance.post(
      `chats/${chatId}/messages/`,
      { ...payload, prompt: payload.prompt.trim() },
      {
        adapter: 'fetch',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/x-ndjson' },
        responseType: 'stream'
      }
    );

    return response.data;
  }
}
