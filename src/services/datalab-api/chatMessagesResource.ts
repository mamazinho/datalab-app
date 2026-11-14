import { axiosCompanyInstance } from "./axios";
import type { IChatFileRef } from "./chatFilesResource";
import type { IChatMember } from "./chatsResource";
import type { IApiError } from "../../types/errors";
import type { UUID7 } from "../../types/ids";

export type IChatStreamEvent =
  | { type: 'user_message'; content: string; files?: IChatFileRef[]; sender?: IChatMember | null; created_at?: string; queued?: boolean }
  | { type: 'text'; content: string; created_at?: string }
  | { type: 'text_delta'; content: string }
  | { type: 'text_replace'; content: string }
  | { type: 'agent_event'; thread_id: string; author: 'supervisor' | 'specialist'; agent_key: string | null; agent_name?: string | null; content: string }
  | { type: 'clarification'; question: string; options?: string[]; tool_call_id: string }
  | { type: 'file'; content?: string; files?: IChatFileRef[]; created_at?: string }
  | { type: 'cancelled' }
  | { type: 'error'; content?: IApiError }
  | { type: 'done' };

// run_id: an answer still going, kept out of the events and followed from its own log
export interface IChatHistory {
  events: IChatStreamEvent[];
  run_id?: UUID7;
}

export interface IUserPrompt {
  prompt: string;
  answer_to_tool_call_id?: string;
  file_ids?: UUID7[];
  model_name?: string;
}

export const ChatMessagesResource = {
  async getChatMessages(chatId: UUID7): Promise<IChatHistory> {
    const response = await axiosCompanyInstance.get(`chats/${chatId}/messages/`);
    return response.data as IChatHistory;
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
  },

  async followRun(chatId: UUID7, runId: UUID7): Promise<ReadableStream<Uint8Array>> {
    const response = await axiosCompanyInstance.get(`chats/${chatId}/run/${runId}/`, {
      adapter: 'fetch',
      headers: { 'Accept': 'application/x-ndjson' },
      responseType: 'stream'
    });

    return response.data;
  },

  async queueMessage(chatId: UUID7, prompt: string): Promise<void> {
    await axiosCompanyInstance.post(`chats/${chatId}/run/messages/`, { prompt: prompt.trim() });
  },

  async cancelRun(chatId: UUID7): Promise<void> {
    await axiosCompanyInstance.post(`chats/${chatId}/run/cancel/`);
  }
}
