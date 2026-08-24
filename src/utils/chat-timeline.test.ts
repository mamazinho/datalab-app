import { describe, expect, it } from 'vitest';
import type {
  IChatMessageRead,
  IChatStreamEvent,
} from '../services/datalab-api/chatMessagesResource';
import { uuid } from '../test/factories';
import {
  appendUserMessage,
  applyStreamEvent,
  findPendingClarification,
  mapHistoryToTimeline,
  setClarificationStatus,
  type IAssistantBubbleItem,
  type IClarificationItem,
  type IThreadBoxItem,
  type TimelineItem,
} from './chat-timeline';

let messageSeed = 0;

const buildMessage = (overrides: Partial<IChatMessageRead> = {}): IChatMessageRead => ({
  id: uuid((messageSeed += 1)),
  author: 'user',
  agent_key: null,
  message_type: 'chat',
  thread_id: null,
  content: 'Olá',
  created_at: '2026-01-01T00:00:00Z',
  channel: 'main',
  ...overrides,
});

const streamBubble = (content: string): TimelineItem[] =>
  applyStreamEvent([], { type: 'text_delta', channel: 'main', content });

const kinds = (items: TimelineItem[]) => items.map((item) => item.kind);

describe('mapHistoryToTimeline', () => {
  it('splits history into user and assistant bubbles, none of them streaming', () => {
    const items = mapHistoryToTimeline([
      buildMessage({ author: 'user', content: 'Qual a receita?' }),
      buildMessage({ author: 'supervisor', content: 'R$ 10.000' }),
    ]);

    expect(kinds(items)).toEqual(['user_message', 'assistant_bubble']);
    expect((items[1] as IAssistantBubbleItem).isStreaming).toBe(false);
  });

  it('drops messages with no content', () => {
    const items = mapHistoryToTimeline([
      buildMessage({ content: null }),
      buildMessage({ content: '' }),
      buildMessage({ content: 'sobrevive' }),
    ]);

    expect(items).toHaveLength(1);
  });

  it('collapses every message of a thread into a single box', () => {
    const items = mapHistoryToTimeline([
      buildMessage({ channel: 'thread', thread_id: 't1', author: 'supervisor', agent_key: null, content: 'delego' }),
      buildMessage({ channel: 'thread', thread_id: 't1', author: 'specialist', agent_key: 'ga4', content: 'consultei' }),
    ]);

    expect(items).toHaveLength(1);
    const box = items[0] as IThreadBoxItem;
    expect(box.entries.map((entry) => entry.author)).toEqual(['supervisor', 'specialist']);
    expect(box.agentKey).toBe('ga4');
  });

  it('keeps separate threads in separate boxes', () => {
    const items = mapHistoryToTimeline([
      buildMessage({ channel: 'thread', thread_id: 't1', author: 'specialist', content: 'a' }),
      buildMessage({ channel: 'thread', thread_id: 't2', author: 'specialist', content: 'b' }),
    ]);

    expect(kinds(items)).toEqual(['thread_box', 'thread_box']);
  });

  it('rehydrates an unanswered trailing clarification as interactive', () => {
    const items = mapHistoryToTimeline([
      buildMessage({ author: 'user', content: 'compare os meses' }),
      buildMessage({
        author: 'supervisor',
        message_type: 'clarification',
        content: 'Quais meses?',
        options: ['Janeiro', 'Fevereiro'],
        tool_call_id: 'call-1',
      }),
    ]);

    const clarification = items.at(-1) as IClarificationItem;
    expect(clarification.status).toBe('pending');
    expect(clarification.options).toEqual(['Janeiro', 'Fevereiro']);
  });

  it('leaves an already answered clarification as history', () => {
    const items = mapHistoryToTimeline([
      buildMessage({
        author: 'supervisor',
        message_type: 'clarification',
        content: 'Quais meses?',
        tool_call_id: 'call-1',
      }),
      buildMessage({ author: 'user', content: 'Janeiro' }),
    ]);

    expect((items[0] as IClarificationItem).status).toBe('historic');
  });

  it('does not reopen a clarification that has no tool call to answer', () => {
    const items = mapHistoryToTimeline([
      buildMessage({ author: 'supervisor', message_type: 'clarification', content: 'Quais meses?' }),
    ]);

    expect((items[0] as IClarificationItem).status).toBe('historic');
  });
});

describe('applyStreamEvent', () => {
  it('opens a streaming bubble on the first delta', () => {
    const items = streamBubble('Oi');

    expect(items).toEqual([
      expect.objectContaining({ kind: 'assistant_bubble', content: 'Oi', isStreaming: true }),
    ]);
  });

  it('concatenates the following deltas into the same bubble', () => {
    let items = streamBubble('Oi');
    items = applyStreamEvent(items, { type: 'text_delta', channel: 'main', content: ', tudo bem?' });

    expect(items).toHaveLength(1);
    expect((items[0] as IAssistantBubbleItem).content).toBe('Oi, tudo bem?');
  });

  it('closes the bubble on done', () => {
    const items = applyStreamEvent(streamBubble('Oi'), { type: 'done' });

    expect((items[0] as IAssistantBubbleItem).isStreaming).toBe(false);
  });

  it('starts a new bubble after the previous one was closed', () => {
    let items = applyStreamEvent(streamBubble('primeira'), { type: 'done' });
    items = applyStreamEvent(items, { type: 'text_delta', channel: 'main', content: 'segunda' });

    expect(kinds(items)).toEqual(['assistant_bubble', 'assistant_bubble']);
  });

  it('closes the open bubble before rendering a thread box', () => {
    const event: IChatStreamEvent = {
      type: 'agent_event',
      channel: 'thread',
      thread_id: 't1',
      author: 'specialist',
      agent_key: 'ga4',
      content: 'consultando',
    };
    const items = applyStreamEvent(streamBubble('pensando'), event);

    expect(kinds(items)).toEqual(['assistant_bubble', 'thread_box']);
    expect((items[0] as IAssistantBubbleItem).isStreaming).toBe(false);
  });

  it('appends later agent events of the same thread to its box', () => {
    const base: IChatStreamEvent = {
      type: 'agent_event',
      channel: 'thread',
      thread_id: 't1',
      author: 'specialist',
      agent_key: 'ga4',
      content: 'passo 1',
    };
    let items = applyStreamEvent([], base);
    items = applyStreamEvent(items, { ...base, content: 'passo 2' });

    expect(items).toHaveLength(1);
    expect((items[0] as IThreadBoxItem).entries).toHaveLength(2);
  });

  it('adds a pending clarification and closes the bubble', () => {
    const items = applyStreamEvent(streamBubble('preciso saber'), {
      type: 'clarification',
      question: 'Qual período?',
      options: ['7 dias'],
      tool_call_id: 'call-1',
    });

    expect(items.at(-1)).toMatchObject({ kind: 'clarification', status: 'pending', toolCallId: 'call-1' });
  });

  it('renders a stream error with a default message', () => {
    const items = applyStreamEvent([], { type: 'error' });

    expect(items.at(-1)).toMatchObject({
      kind: 'stream_error',
      content: 'Erro desconhecido no processamento.',
    });
  });

  it('ignores an unknown event instead of breaking the timeline', () => {
    const items = streamBubble('Oi');

    expect(applyStreamEvent(items, { type: 'nao_existe' } as unknown as IChatStreamEvent)).toBe(items);
  });
});

describe('clarification helpers', () => {
  const withPendingClarification = () =>
    applyStreamEvent([], {
      type: 'clarification',
      question: 'Qual período?',
      options: [],
      tool_call_id: 'call-1',
    });

  it('finds the clarification waiting for an answer', () => {
    expect(findPendingClarification(withPendingClarification())?.toolCallId).toBe('call-1');
  });

  it('returns null when nothing is waiting', () => {
    expect(findPendingClarification(streamBubble('Oi'))).toBeNull();
  });

  it('records the answer on the matching clarification only', () => {
    const items = setClarificationStatus(withPendingClarification(), 'call-1', 'answered', '7 dias');

    expect(items[0]).toMatchObject({ status: 'answered', answer: '7 dias' });
    expect(findPendingClarification(items)).toBeNull();
  });

  it('leaves other clarifications untouched', () => {
    const items = setClarificationStatus(withPendingClarification(), 'outro-call', 'answered');

    expect(findPendingClarification(items)?.toolCallId).toBe('call-1');
  });
});

describe('appendUserMessage', () => {
  it('adds the message at the end with a unique id', () => {
    const first = appendUserMessage([], 'oi');
    const second = appendUserMessage(first, 'de novo');

    expect(kinds(second)).toEqual(['user_message', 'user_message']);
    expect(second[0].id).not.toBe(second[1].id);
  });
});
