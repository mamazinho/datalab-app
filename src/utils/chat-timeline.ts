import type { IChatFileRef } from '../services/datalab-api/chatFilesResource';
import type { IChatStreamEvent } from '../services/datalab-api/chatMessagesResource';
import type { IChatMember } from '../services/datalab-api/chatsResource';

export type ThreadAuthor = 'supervisor' | 'specialist';

export interface IThreadEntry {
  author: ThreadAuthor;
  agentKey: string | null;
  content: string;
}

export interface IUserMessageItem {
  kind: 'user_message';
  id: string;
  content: string;
  attachments: IChatFileRef[];
  sender: IChatMember | null;
  createdAt: string;
}

export interface IAssistantBubbleItem {
  kind: 'assistant_bubble';
  id: string;
  content: string;
  isStreaming: boolean;
  files: IChatFileRef[];
  createdAt: string;
}

export interface IThreadBoxItem {
  kind: 'thread_box';
  id: string;
  threadId: string;
  agentKey: string | null;
  entries: IThreadEntry[];
}

export interface IClarificationItem {
  kind: 'clarification';
  id: string;
  question: string;
  options: string[];
  toolCallId: string;
  status: 'pending' | 'answered';
  answer?: string;
}

export interface IStreamErrorItem {
  kind: 'stream_error';
  id: string;
  content: string;
}

export type TimelineItem =
  | IUserMessageItem
  | IAssistantBubbleItem
  | IThreadBoxItem
  | IClarificationItem
  | IStreamErrorItem;

let itemIdCounter = 0;
const nextItemId = (prefix: string): string => `${prefix}-${++itemIdCounter}`;

const now = () => new Date().toISOString();

const appendThreadEntry = (items: TimelineItem[], threadId: string, entry: IThreadEntry): TimelineItem[] => {
  const box = items.find((item): item is IThreadBoxItem => item.kind === 'thread_box' && item.threadId === threadId);

  if (!box) {
    return [...items, { kind: 'thread_box', id: nextItemId('thread'), threadId, agentKey: entry.agentKey, entries: [entry] }];
  }

  return items.map((item) =>
    item === box ? { ...box, agentKey: box.agentKey ?? entry.agentKey, entries: [...box.entries, entry] } : item,
  );
};

const closeStreamingBubble = (items: TimelineItem[]): TimelineItem[] => {
  const lastItem = items[items.length - 1];
  if (lastItem?.kind !== 'assistant_bubble' || !lastItem.isStreaming) return items;

  return [...items.slice(0, -1), { ...lastItem, isStreaming: false }];
};

const newBubble = (content: string, createdAt = now()): IAssistantBubbleItem => ({
  kind: 'assistant_bubble',
  id: nextItemId('bubble'),
  content,
  isStreaming: false,
  files: [],
  createdAt,
});

// The backend sends the file in its own event, right after the supervisor text
const attachFiles = (items: TimelineItem[], event: Extract<IChatStreamEvent, { type: 'file' }>): TimelineItem[] => {
  if (!event.files?.length) return items;

  const closed = closeStreamingBubble(items);
  const lastItem = closed[closed.length - 1];
  if (lastItem?.kind === 'assistant_bubble') {
    return [...closed.slice(0, -1), { ...lastItem, files: [...lastItem.files, ...event.files] }];
  }
  return [...closed, { ...newBubble(event.content ?? '', event.created_at), files: event.files }];
};

const answerPendingClarification = (items: TimelineItem[], answer: string): TimelineItem[] =>
  items.map((item) =>
    item.kind === 'clarification' && item.status === 'pending' ? { ...item, status: 'answered', answer } : item,
  );

export const applyChatEvent = (items: TimelineItem[], event: IChatStreamEvent): TimelineItem[] => {
  switch (event.type) {
    case 'user_message':
      return [
        ...answerPendingClarification(closeStreamingBubble(items), event.content),
        {
          kind: 'user_message',
          id: nextItemId('user'),
          content: event.content,
          attachments: event.files ?? [],
          sender: event.sender ?? null,
          createdAt: event.created_at ?? now(),
        },
      ];

    case 'text':
      return [...closeStreamingBubble(items), newBubble(event.content, event.created_at)];

    case 'text_delta': {
      const lastItem = items[items.length - 1];
      if (lastItem?.kind === 'assistant_bubble' && lastItem.isStreaming) {
        return [...items.slice(0, -1), { ...lastItem, content: lastItem.content + event.content }];
      }
      return [...items, { ...newBubble(event.content), isStreaming: true }];
    }

    case 'text_replace': {
      const lastItem = items[items.length - 1];
      if (lastItem?.kind !== 'assistant_bubble') return items;
      return [...items.slice(0, -1), { ...lastItem, content: event.content }];
    }

    case 'agent_event':
      return appendThreadEntry(closeStreamingBubble(items), event.thread_id, {
        author: event.author,
        agentKey: event.agent_key,
        content: event.content,
      });

    case 'clarification':
      return [
        ...closeStreamingBubble(items),
        {
          kind: 'clarification',
          id: nextItemId('clarification'),
          question: event.question,
          options: event.options ?? [],
          toolCallId: event.tool_call_id,
          status: 'pending',
        },
      ];

    case 'file':
      return attachFiles(items, event);

    case 'error':
      return [
        ...closeStreamingBubble(items),
        { kind: 'stream_error', id: nextItemId('error'), content: event.content ?? 'Erro desconhecido no processamento.' },
      ];

    case 'done':
      return closeStreamingBubble(items);

    default:
      return items;
  }
};

export const reopenClarification = (items: TimelineItem[], toolCallId: string): TimelineItem[] =>
  items.map((item) =>
    item.kind === 'clarification' && item.toolCallId === toolCallId ? { ...item, status: 'pending', answer: undefined } : item,
  );

export const findPendingClarification = (items: TimelineItem[]): IClarificationItem | null =>
  items.find((item): item is IClarificationItem => item.kind === 'clarification' && item.status === 'pending') ?? null;
