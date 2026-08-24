import { describe, expect, it, vi } from 'vitest';
import type { IChatStreamEvent } from '../services/datalab-api/chatMessagesResource';
import { parseChatStream } from './process-stream';

const encoder = new TextEncoder();

const streamOf = (chunks: string[]): ReadableStream<Uint8Array> =>
  new ReadableStream({
    start(controller) {
      chunks.forEach((chunk) => controller.enqueue(encoder.encode(chunk)));
      controller.close();
    },
  });

const collect = async (chunks: string[]): Promise<IChatStreamEvent[]> => {
  const events: IChatStreamEvent[] = [];
  for await (const event of parseChatStream(streamOf(chunks))) {
    events.push(event);
  }
  return events;
};

describe('parseChatStream', () => {
  it('yields one event per line', async () => {
    const events = await collect([
      '{"type":"text_delta","channel":"main","content":"Oi"}\n',
      '{"type":"done"}\n',
    ]);

    expect(events).toEqual([
      { type: 'text_delta', channel: 'main', content: 'Oi' },
      { type: 'done' },
    ]);
  });

  it('rebuilds an event split across chunks', async () => {
    const events = await collect(['{"type":"text_delta","chan', 'nel":"main","content":"Oi"}\n']);

    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({ content: 'Oi' });
  });

  it('emits the last event even without a trailing newline', async () => {
    const events = await collect(['{"type":"done"}']);

    expect(events).toEqual([{ type: 'done' }]);
  });

  it('handles several events arriving in one chunk', async () => {
    const events = await collect([
      '{"type":"text_delta","channel":"main","content":"a"}\n{"type":"text_delta","channel":"main","content":"b"}\n',
    ]);

    expect(events).toHaveLength(2);
  });

  it('skips blank lines', async () => {
    const events = await collect(['\n\n{"type":"done"}\n\n']);

    expect(events).toEqual([{ type: 'done' }]);
  });

  it('drops a malformed line and keeps the stream alive', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const events = await collect(['isso nao e json\n{"type":"done"}\n']);

    expect(events).toEqual([{ type: 'done' }]);
    expect(warn).toHaveBeenCalled();
  });

  it('drops valid JSON that is not an event', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});

    const events = await collect(['{"sem":"type"}\n{"type":"done"}\n']);

    expect(events).toEqual([{ type: 'done' }]);
  });

  it('yields nothing for an empty stream', async () => {
    expect(await collect([])).toEqual([]);
  });

  it('releases the reader when the consumer stops early', async () => {
    const stream = streamOf([
      '{"type":"text_delta","channel":"main","content":"a"}\n{"type":"done"}\n',
    ]);

    for await (const event of parseChatStream(stream)) {
      expect(event).toMatchObject({ type: 'text_delta' });
      break;
    }

    expect(() => stream.getReader()).not.toThrow();
  });
});
