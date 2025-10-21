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
  
  console.log("stream", stream);
  let text = '';
  const decoder = new TextDecoder();
  const reader = stream.getReader();

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      text += decoder.decode(value);
      console.log("processing data chunk", text);
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
