import { axiosCompanyInstance } from "./axios";
import type { IChatFileRef } from "./chatFilesResource";
import type { IChatMember } from "./chatsResource";
import type { UUID7 } from "../../types/ids";

export type IChatStreamEvent =
  | { type: 'user_message'; content: string; files?: IChatFileRef[]; sender?: IChatMember | null; created_at?: string }
  | { type: 'text'; content: string; created_at?: string }
  | { type: 'text_delta'; content: string }
  | { type: 'text_replace'; content: string }
  | { type: 'agent_event'; thread_id: string; author: 'supervisor' | 'specialist'; agent_key: string | null; content: string }
  | { type: 'clarification'; question: string; options?: string[]; tool_call_id: string }
  | { type: 'file'; content?: string; files?: IChatFileRef[]; created_at?: string }
  | { type: 'error'; content?: string }
  | { type: 'done' };

export interface IUserPrompt {
  prompt: string;
  answer_to_tool_call_id?: string;
  file_ids?: UUID7[];
}

export const ChatMessagesResource = {
  async getChatMessages(chatId: UUID7): Promise<IChatStreamEvent[]> {
    const response = await axiosCompanyInstance.get(`chats/${chatId}/messages/`);
    return response.data as IChatStreamEvent[];
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
