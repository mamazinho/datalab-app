import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { DatalabAPI } from '../../../services/datalab-api';
import type { IChatMessageRead, IChatStreamEvent } from '../../../services/datalab-api/chatMessagesResource';
import { parseChatStream } from '../../../utils/process-stream';
import {
  appendUserMessage,
  applyStreamEvent,
  findPendingClarification,
  mapHistoryToTimeline,
  setClarificationStatus,
  type ClarificationStatus,
  type TimelineItem,
} from '../../../utils/chat-timeline';

type TimelineAction =
  | { type: 'reset'; history: IChatMessageRead[] }
  | { type: 'user_prompt'; content: string }
  | { type: 'stream_event'; event: IChatStreamEvent }
  | { type: 'clarification_status'; toolCallId: string; status: ClarificationStatus; answer?: string };

const timelineReducer = (items: TimelineItem[], action: TimelineAction): TimelineItem[] => {
  switch (action.type) {
    case 'reset':
      return mapHistoryToTimeline(action.history);
    case 'user_prompt':
      return appendUserMessage(items, action.content);
    case 'stream_event':
      return applyStreamEvent(items, action.event);
    case 'clarification_status':
      return setClarificationStatus(items, action.toolCallId, action.status, action.answer);
  }
};

const getErrorMessage = (error: unknown, fallback: string): string =>
  error instanceof Error && error.message ? error.message : fallback;

export const useChatStream = (chatId: number, initialHistory: IChatMessageRead[]) => {
  const [items, dispatch] = useReducer(timelineReducer, initialHistory, mapHistoryToTimeline);
  const [isStreaming, setIsStreaming] = useState(false);
  // Identifica a "geração" ativa do stream: trocar de chat/desmontar invalida loops em andamento
  const generationRef = useRef(0);

  useEffect(() => {
    generationRef.current += 1;
    setIsStreaming(false);
    dispatch({ type: 'reset', history: initialHistory });
  }, [chatId, initialHistory]);

  useEffect(() => () => {
    generationRef.current += 1;
  }, []);

  const pendingClarification = useMemo(() => findPendingClarification(items), [items]);

  const submitPrompt = useCallback(async (prompt: string, answerToToolCallId?: string) => {
    const generation = ++generationRef.current;

    dispatch({ type: 'user_prompt', content: prompt });
    if (answerToToolCallId) {
      dispatch({ type: 'clarification_status', toolCallId: answerToToolCallId, status: 'answered', answer: prompt });
    }
    setIsStreaming(true);

    let stream: ReadableStream<Uint8Array>;
    try {
      stream = await DatalabAPI.ChatMessagesResource.sendMessage(chatId, {
        prompt,
        ...(answerToToolCallId ? { answer_to_tool_call_id: answerToToolCallId } : {}),
      });
    } catch (requestError) {
      if (generationRef.current !== generation) return;
      // POST falhou antes do stream iniciar: reabre a clarification para nova tentativa
      if (answerToToolCallId) {
        dispatch({ type: 'clarification_status', toolCallId: answerToToolCallId, status: 'pending' });
      }
      dispatch({
        type: 'stream_event',
        event: { type: 'error', content: getErrorMessage(requestError, 'Erro ao enviar a mensagem.') },
      });
      setIsStreaming(false);
      return;
    }

    try {
      for await (const event of parseChatStream(stream)) {
        if (generationRef.current !== generation) return;
        dispatch({ type: 'stream_event', event });
      }
    } catch (streamError) {
      if (generationRef.current !== generation) return;
      dispatch({
        type: 'stream_event',
        event: { type: 'error', content: getErrorMessage(streamError, 'A conexão com o servidor foi interrompida.') },
      });
    } finally {
      if (generationRef.current === generation) {
        // Fecha a bolha em streaming mesmo se o backend encerrar sem evento "done"
        dispatch({ type: 'stream_event', event: { type: 'done' } });
        setIsStreaming(false);
      }
    }
  }, [chatId]);

  const sendPrompt = useCallback(async (prompt: string) => {
    const trimmedPrompt = prompt.trim();
    if (!trimmedPrompt || isStreaming) return;

    // Com clarification pendente, texto livre também é resposta a ela (sempre permitido)
    await submitPrompt(trimmedPrompt, pendingClarification?.toolCallId ?? undefined);
  }, [isStreaming, pendingClarification, submitPrompt]);

  const answerClarification = useCallback(async (answer: string) => {
    if (!pendingClarification?.toolCallId || isStreaming) return;
    await submitPrompt(answer, pendingClarification.toolCallId);
  }, [isStreaming, pendingClarification, submitPrompt]);

  return { items, isStreaming, pendingClarification, sendPrompt, answerClarification };
};
