import { axionsInstance } from "./axios";

export interface IMessage {
  role: string;
  content: string;
  timestamp: string;
}

const parseMessages = (responseText: string): IMessage[] => {
  const lines = responseText.split('\n');
  return lines
    .filter(line => line.length > 1)
    .map(line => {
      try {
        return JSON.parse(line);
      } catch {
        console.warn('Failed to parse line:', line);
        return null;
      }
    })
    .filter(Boolean);
}

export async function processStreamResponse(
  stream: ReadableStream<Uint8Array> | null,
  onMessage: (messages: IMessage[]) => void,
  onComplete?: () => void
): Promise<void> {
  if (!stream) return;
  
  let text = '';
  const decoder = new TextDecoder();
  const reader = stream.getReader();

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      text += decoder.decode(value);
      const messages = parseMessages(text);
      onMessage(messages);
    }
    onComplete?.();
  } catch (error) {
    console.error('Error processing stream:', error);
    throw error;
  } finally {
    console.log("finally");
    reader.releaseLock();
  }
}

export const ChatMessagesResource = {
  async getChatMessages(chatId: number): Promise<ReadableStream<Uint8Array>> {
    const response = await axionsInstance.get(
      `v1/chats/${chatId}/messages/`,
      { 
        adapter: 'fetch',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        responseType: 'stream'
      },
    )
    console.log("get chat messages", response.data)
    return response.data;
  },
  async sendMessage(chatId: number, message: string): Promise<ReadableStream<Uint8Array>> {
    const formData = new FormData();
    formData.append('prompt', message);
    const response = await axionsInstance.post(
      `v1/chats/${chatId}/messages/`,
      formData,
      {
        adapter: 'fetch',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        responseType: 'stream'
      }
    );

    console.log("response post", response.data)
    return response.data;
  }
}
