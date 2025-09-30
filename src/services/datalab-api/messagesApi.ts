interface Message {
  role: string;
  content: string;
  timestamp: string;
}

class ChatApiService {
  private apiUrl: string;

  constructor() {
    this.apiUrl = import.meta.env.VITE_DATALAB_API_URL;
  }

  /**
   * Fetch existing messages from the chat API using fetch for proper streaming
   */
  async getChatMessages(chatId: string): Promise<ReadableStream<Uint8Array> | null> {
    try {
      const response = await fetch(`${this.apiUrl}/v1/chats/${chatId}/messages/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'cors', // Enable CORS
        cache: 'no-cache',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return response.body;
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
  }

  /**
   * Send a new message to the chat API using fetch for proper streaming
   */
  async sendMessage(prompt: string): Promise<ReadableStream<Uint8Array> | null> {
    try {
      const formData = new FormData();
      formData.append('prompt', prompt);

      const response = await fetch(`${this.apiUrl}/v1/chats/1/messages/`, {
        method: 'POST',
        body: formData,
        mode: 'cors', // Enable CORS
        cache: 'no-cache',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return response.body;
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