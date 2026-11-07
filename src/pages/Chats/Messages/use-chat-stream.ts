import { useEffect, useReducer, useRef, useState } from 'react';
import { DatalabAPI } from '../../../services/datalab-api';
import type { IChatFileRef } from '../../../services/datalab-api/chatFilesResource';
import type { IChatStreamEvent } from '../../../services/datalab-api/chatMessagesResource';
import { useMe } from '../../../hooks/use-me';
import { parseChatStream } from '../../../utils/process-stream';
import { ApiError, clientError } from '../../../utils/api-error';
import type { UUID7 } from '../../../types/ids';
import {
  applyChatEvent,
  findPendingClarification,
  reopenClarification,
  type TimelineItem,
} from '../../../utils/chat-timeline';

type TimelineAction =
  | { type: 'event'; event: IChatStreamEvent }
  | { type: 'reopen_clarification'; toolCallId: string };

const replay = (history: IChatStreamEvent[]) => history.reduce(applyChatEvent, []);

const timelineReducer = (items: TimelineItem[], action: TimelineAction): TimelineItem[] => {
  switch (action.type) {
    case 'event':
      return applyChatEvent(items, action.event);
    case 'reopen_clarification':
      return reopenClarification(items, action.toolCallId);
  }
};

const STREAM_INTERRUPTED_MESSAGE = 'A conexão com o servidor caiu no meio da resposta. Tente novamente.';

const EMPTY_PROMPT_WITH_ATTACHMENTS = 'Analise o arquivo anexado.';

export const useChatStream = (chatId: UUID7, initialHistory: IChatStreamEvent[]) => {
  const { data: me } = useMe();
  const [items, dispatch] = useReducer(timelineReducer, initialHistory, replay);
  const [isStreaming, setIsStreaming] = useState(false);
  // Stream generation: unmounting (another chat, or a fresh history) invalidates the loops still running
  const generationRef = useRef(0);

  useEffect(() => () => {
    generationRef.current += 1;
  }, []);

  const pendingClarification = findPendingClarification(items);

  const submitPrompt = async (
    prompt: string,
    attachments: IChatFileRef[] = [],
    answerToToolCallId?: string,
  ) => {
    const generation = ++generationRef.current;

    dispatch({ type: 'event', event: { type: 'user_message', content: prompt, files: attachments, sender: me ?? null } });
    setIsStreaming(true);

    let stream: ReadableStream<Uint8Array>;
    try {
      stream = await DatalabAPI.ChatMessagesResource.sendMessage(chatId, {
        prompt,
        ...(answerToToolCallId ? { answer_to_tool_call_id: answerToToolCallId } : {}),
        ...(attachments.length ? { file_ids: attachments.map((file) => file.id) } : {}),
      });
    } catch (requestError) {
      if (generationRef.current !== generation) return;
      // The POST failed before the stream started, so the clarification reopens for a retry
      if (answerToToolCallId) {
        dispatch({ type: 'reopen_clarification', toolCallId: answerToToolCallId });
      }
      dispatch({ type: 'event', event: { type: 'error', content: ApiError.from(requestError) } });
      setIsStreaming(false);
      return;
    }

    try {
      for await (const event of parseChatStream(stream)) {
        if (generationRef.current !== generation) return;
        dispatch({ type: 'event', event });
      }
    } catch {
      if (generationRef.current !== generation) return;
      dispatch({ type: 'event', event: { type: 'error', content: clientError(STREAM_INTERRUPTED_MESSAGE) } });
    } finally {
      if (generationRef.current === generation) {
        // Closes the streaming bubble even if the backend ends without a done event
        dispatch({ type: 'event', event: { type: 'done' } });
        setIsStreaming(false);
      }
    }
  };

  const sendPrompt = async (prompt: string, attachments: IChatFileRef[] = []) => {
    const trimmedPrompt = prompt.trim();
    if ((!trimmedPrompt && attachments.length === 0) || isStreaming) return;

    // With a pending clarification, free text also answers it
    await submitPrompt(
      trimmedPrompt || EMPTY_PROMPT_WITH_ATTACHMENTS,
      attachments,
      pendingClarification?.toolCallId,
    );
  };

  const answerClarification = async (answer: string) => {
    if (!pendingClarification || isStreaming) return;
    await submitPrompt(answer, [], pendingClarification.toolCallId);
  };

  return { items, isStreaming, pendingClarification, sendPrompt, answerClarification };
};
