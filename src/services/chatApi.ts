import axios, { type AxiosResponse } from 'axios';

interface Message {
  role: string;
  content: string;
  timestamp: string;
}

class ChatApiService {
  private apiUrl: string;

  constructor() {
    this.apiUrl = import.meta.env.DATALAB_API_URL || 'http://localhost:3000';
  }

  /**
   * Fetch existing messages from the chat API
   */
  async getMessages(): Promise<ReadableStream<Uint8Array> | null> {
    try {
      const response: AxiosResponse = await axios.get(
        `${this.apiUrl}/v1/chats/1/messages/`,
        {
          responseType: 'stream'
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
  }

  /**
   * Send a new message to the chat API
   */
  async sendMessage(prompt: string): Promise<ReadableStream<Uint8Array> | null> {
    try {
      const formData = new FormData();
      formData.append('prompt', prompt);

      const response: AxiosResponse = await axios.post(
        `${this.apiUrl}/v1/chats/1/messages/`,
        formData,
        {
          responseType: 'stream',
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  /**
   * Process streaming response and parse messages
   */
  async processStreamResponse(
    stream: ReadableStream<Uint8Array> | null,
    onMessage: (messages: Message[]) => void,
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
        const messages = this.parseMessages(text);
        onMessage(messages);
      }
      onComplete?.();
    } catch (error) {
      console.error('Error processing stream:', error);
      throw error;
    } finally {
      reader.releaseLock();
    }
  }

  /**
   * Parse response text and extract messages
   */
  private parseMessages(responseText: string): Message[] {
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
}

export default new ChatApiService();
export type { Message };