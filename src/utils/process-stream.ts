import type { IChatStreamEvent } from '../services/datalab-api/chatMessagesResource';

const parseEventLine = (line: string): IChatStreamEvent | null => {
  const trimmed = line.trim();
  if (!trimmed) return null;

  try {
    const parsed: unknown = JSON.parse(trimmed);
    if (parsed && typeof parsed === 'object' && typeof (parsed as { type?: unknown }).type === 'string') {
      return parsed as IChatStreamEvent;
    }
    console.warn('Ignoring stream line without a valid type:', trimmed);
    return null;
  } catch {
    console.warn('Failed to parse stream line:', trimmed);
    return null;
  }
};

export async function* parseChatStream(
  stream: ReadableStream<Uint8Array>
): AsyncGenerator<IChatStreamEvent> {
  const decoder = new TextDecoder();
  const reader = stream.getReader();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        const event = parseEventLine(line);
        if (event) yield event;
      }
    }

    buffer += decoder.decode();
    const lastEvent = parseEventLine(buffer);
    if (lastEvent) yield lastEvent;
  } finally {
    try {
      await reader.cancel();
    } catch {
      // stream já encerrado
    }
    reader.releaseLock();
  }
}
