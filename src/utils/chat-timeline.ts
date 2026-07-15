import type { IChatMessageRead, IChatStreamEvent } from '../services/datalab-api/chatMessagesResource';

export type ClarificationStatus = 'pending' | 'answered' | 'historic';
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
}

export interface IAssistantBubbleItem {
  kind: 'assistant_bubble';
  id: string;
  content: string;
  isStreaming: boolean;
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
  toolCallId: string | null;
  status: ClarificationStatus;
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

const appendThreadEntry = (
  items: TimelineItem[],
  threadId: string,
  entry: IThreadEntry,
): TimelineItem[] => {
  const existingBox = items.find(
    (item): item is IThreadBoxItem => item.kind === 'thread_box' && item.threadId === threadId,
  );

  if (!existingBox) {
    return [
      ...items,
      {
        kind: 'thread_box',
        id: nextItemId('thread'),
        threadId,
        agentKey: entry.agentKey,
        entries: [entry],
      },
    ];
  }

  return items.map((item) =>
    item === existingBox
      ? { ...existingBox, agentKey: existingBox.agentKey ?? entry.agentKey, entries: [...existingBox.entries, entry] }
      : item,
  );
};

const closeStreamingBubble = (items: TimelineItem[]): TimelineItem[] => {
  const lastItem = items[items.length - 1];
  if (lastItem?.kind !== 'assistant_bubble' || !lastItem.isStreaming) return items;

  return [...items.slice(0, -1), { ...lastItem, isStreaming: false }];
};

export const mapHistoryToTimeline = (messages: IChatMessageRead[]): TimelineItem[] => {
  let items: TimelineItem[] = [];
  let lastClarification: IClarificationItem | null = null;

  for (const message of messages) {
    const content = message.content ?? '';

    if (message.channel === 'thread' && message.thread_id) {
      items = appendThreadEntry(items, message.thread_id, {
        author: message.author === 'specialist' ? 'specialist' : 'supervisor',
        agentKey: message.agent_key,
        content,
      });
      continue;
    }

    if (message.message_type === 'clarification') {
      const clarification: IClarificationItem = {
        kind: 'clarification',
        id: `hist-${message.id}`,
        question: content,
        options: message.options ?? [],
        toolCallId: message.tool_call_id ?? null,
        status: 'historic',
      };
      lastClarification = clarification;
      items = [...items, clarification];
      continue;
    }

    lastClarification = null;
    if (!content) continue;

    if (message.author === 'user') {
      items = [...items, { kind: 'user_message', id: `hist-${message.id}`, content }];
      continue;
    }

    items = [...items, { kind: 'assistant_bubble', id: `hist-${message.id}`, content, isStreaming: false }];
  }

  // Clarification no fim do histórico ainda não respondida → reidrata o card interativo
  if (lastClarification?.toolCallId) {
    items = items.map((item) =>
      item === lastClarification ? { ...lastClarification, status: 'pending' as const } : item,
    );
  }

  return items;
};

export const applyStreamEvent = (items: TimelineItem[], event: IChatStreamEvent): TimelineItem[] => {
  switch (event.type) {
    case 'text_delta': {
      const lastItem = items[items.length - 1];

      if (lastItem?.kind === 'assistant_bubble' && lastItem.isStreaming) {
        return [...items.slice(0, -1), { ...lastItem, content: lastItem.content + event.content }];
      }

      return [
        ...items,
        { kind: 'assistant_bubble', id: nextItemId('bubble'), content: event.content, isStreaming: true },
      ];
    }

    case 'agent_event': {
      return appendThreadEntry(closeStreamingBubble(items), event.thread_id, {
        author: event.author,
        agentKey: event.agent_key,
        content: event.content,
      });
    }

    case 'clarification': {
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
    }

    case 'error': {
      return [
        ...closeStreamingBubble(items),
        { kind: 'stream_error', id: nextItemId('error'), content: event.content ?? 'Erro desconhecido no processamento.' },
      ];
    }

    case 'done':
      return closeStreamingBubble(items);

    default:
      return items;
  }
};

export const appendUserMessage = (items: TimelineItem[], content: string): TimelineItem[] => [
  ...items,
  { kind: 'user_message', id: nextItemId('user'), content },
];

export const setClarificationStatus = (
  items: TimelineItem[],
  toolCallId: string,
  status: ClarificationStatus,
  answer?: string,
): TimelineItem[] =>
  items.map((item) =>
    item.kind === 'clarification' && item.toolCallId === toolCallId
      ? { ...item, status, answer }
      : item,
  );

export const findPendingClarification = (items: TimelineItem[]): IClarificationItem | null =>
  items.find(
    (item): item is IClarificationItem => item.kind === 'clarification' && item.status === 'pending',
  ) ?? null;
