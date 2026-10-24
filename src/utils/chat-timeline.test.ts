import { describe, expect, it } from 'vitest';
import type { IChatStreamEvent } from '../services/datalab-api/chatMessagesResource';
import { uuid } from '../test/factories';
import {
  applyChatEvent,
  findPendingClarification,
  reopenClarification,
  type IAssistantBubbleItem,
  type IClarificationItem,
  type IThreadBoxItem,
  type IUserMessageItem,
  type TimelineItem,
} from './chat-timeline';

const replay = (events: IChatStreamEvent[], from: TimelineItem[] = []) => events.reduce(applyChatEvent, from);

const kinds = (items: TimelineItem[]) => items.map((item) => item.kind);

const fileRef = { id: uuid(70), filename: 'relatorio.pdf', media_type: 'application/pdf', size: 2048 };

const question: IChatStreamEvent = {
  type: 'clarification',
  question: 'De qual período?',
  options: ['7 dias'],
  tool_call_id: 'call-1',
};

describe('applyChatEvent', () => {
  describe('history', () => {
    it('turns the user prompt and the answer into closed bubbles with their time', () => {
      const items = replay([
        { type: 'user_message', content: 'Qual foi a receita?', created_at: '2026-01-01T12:00:00Z' },
        { type: 'text', content: 'R$ 10.000.', created_at: '2026-01-01T12:00:05Z' },
      ]);

      expect(kinds(items)).toEqual(['user_message', 'assistant_bubble']);
      const [prompt, answer] = items as [IUserMessageItem, IAssistantBubbleItem];
      expect(prompt.createdAt).toBe('2026-01-01T12:00:00Z');
      expect(answer).toMatchObject({ content: 'R$ 10.000.', isStreaming: false, createdAt: '2026-01-01T12:00:05Z' });
    });

    it('collapses the events of a thread into one box and keeps other threads apart', () => {
      const items = replay([
        { type: 'agent_event', thread_id: 't1', author: 'supervisor', agent_key: 'ga4', content: 'Pergunta' },
        { type: 'agent_event', thread_id: 't1', author: 'specialist', agent_key: 'ga4', content: 'Resposta' },
        { type: 'agent_event', thread_id: 't2', author: 'specialist', agent_key: 'meta', content: 'Outra' },
      ]);

      const [first, second] = items as IThreadBoxItem[];
      expect(first.entries.map((entry) => entry.content)).toEqual(['Pergunta', 'Resposta']);
      expect(second.threadId).toBe('t2');
    });

    it('keeps an unanswered question waiting', () => {
      expect(findPendingClarification(replay([question]))?.toolCallId).toBe('call-1');
    });

    it('marks a question as answered by the message that follows it', () => {
      const items = replay([question, { type: 'user_message', content: '7 dias' }]);

      expect(items[0]).toMatchObject({ status: 'answered', answer: '7 dias' });
      expect(findPendingClarification(items)).toBeNull();
    });

    it('keeps the attachments of a user prompt on its bubble', () => {
      const [prompt] = replay([{ type: 'user_message', content: 'Resuma', files: [fileRef] }]) as IUserMessageItem[];

      expect(prompt.attachments).toEqual([fileRef]);
    });

    it('puts a delivered file inside the answer that precedes it', () => {
      const items = replay([{ type: 'text', content: 'Segue.' }, { type: 'file', files: [fileRef] }]);

      expect(items).toHaveLength(1);
      expect((items[0] as IAssistantBubbleItem).files).toEqual([fileRef]);
    });

    it('opens a bubble with the delivery text when no answer precedes the file', () => {
      const [bubble] = replay([{ type: 'file', content: 'Arquivo disponível.', files: [fileRef] }]) as IAssistantBubbleItem[];

      expect(bubble).toMatchObject({ content: 'Arquivo disponível.', files: [fileRef] });
    });

    it('ignores a file event with no file reference', () => {
      expect(replay([{ type: 'file', files: [] }])).toEqual([]);
    });
  });

  describe('streaming', () => {
    it('opens a streaming bubble on the first delta and grows it with the next ones', () => {
      const [bubble] = replay([
        { type: 'text_delta', content: 'A receita ' },
        { type: 'text_delta', content: 'foi R$ 10.000.' },
      ]) as IAssistantBubbleItem[];

      expect(bubble).toMatchObject({ content: 'A receita foi R$ 10.000.', isStreaming: true });
    });

    it('closes the bubble on done and starts a new one afterwards', () => {
      const items = replay([
        { type: 'text_delta', content: 'Primeira' },
        { type: 'done' },
        { type: 'text_delta', content: 'Segunda' },
      ]);

      expect(items.map((item) => (item as IAssistantBubbleItem).isStreaming)).toEqual([false, true]);
    });

    it('closes the open bubble before a thread box', () => {
      const items = replay([
        { type: 'text_delta', content: 'Vou consultar.' },
        { type: 'agent_event', thread_id: 't1', author: 'supervisor', agent_key: 'ga4', content: 'Pergunta' },
      ]);

      expect(kinds(items)).toEqual(['assistant_bubble', 'thread_box']);
      expect((items[0] as IAssistantBubbleItem).isStreaming).toBe(false);
    });

    it('swaps the streamed text for the reviewed answer', () => {
      const [bubble] = replay([
        { type: 'text_delta', content: 'Veja em sandbox:/mnt/data/a.pdf' },
        { type: 'text_replace', content: 'Veja o arquivo abaixo.' },
      ]) as IAssistantBubbleItem[];

      expect(bubble.content).toBe('Veja o arquivo abaixo.');
    });

    it('adds a waiting question and closes the bubble', () => {
      const items = replay([{ type: 'text_delta', content: 'Preciso saber:' }, question]);

      expect((items[0] as IAssistantBubbleItem).isStreaming).toBe(false);
      expect((items[1] as IClarificationItem).status).toBe('pending');
    });

    it('shows a stream error with a default message', () => {
      expect(replay([{ type: 'error' }])[0]).toMatchObject({
        kind: 'stream_error',
        content: 'Erro desconhecido no processamento.',
      });
    });

    it('ignores an unknown event instead of breaking the timeline', () => {
      const items = replay([{ type: 'text', content: 'Oi' }]);

      expect(applyChatEvent(items, { type: 'heartbeat' } as unknown as IChatStreamEvent)).toBe(items);
    });
  });
});

describe('reopenClarification', () => {
  it('waits again only for the question whose answer failed to send', () => {
    const answered = replay([
      question,
      { type: 'user_message', content: '7 dias' },
      { ...question, tool_call_id: 'call-2' },
      { type: 'user_message', content: 'ontem' },
    ]);

    const items = reopenClarification(answered, 'call-2');

    expect(findPendingClarification(items)?.toolCallId).toBe('call-2');
    expect(items[0]).toMatchObject({ status: 'answered' });
  });
});
