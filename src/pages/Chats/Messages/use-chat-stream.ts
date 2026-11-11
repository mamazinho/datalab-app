import { useEffect, useEffectEvent, useReducer, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { DatalabAPI } from '../../../services/datalab-api';
import type { IChatFileRef } from '../../../services/datalab-api/chatFilesResource';
import type { IChatHistory, IChatStreamEvent } from '../../../services/datalab-api/chatMessagesResource';
import { useMe } from '../../../hooks/use-me';
import { chatMessagesQuery } from '../../../queries';
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
  | { type: 'reopen_clarification'; toolCallId: string }
  | { type: 'retract_last_user_message' };

const replay = (history: IChatStreamEvent[]) => history.reduce(applyChatEvent, []);

const timelineReducer = (items: TimelineItem[], action: TimelineAction): TimelineItem[] => {
  switch (action.type) {
    case 'event':
      return applyChatEvent(items, action.event);
    case 'reopen_clarification':
      return reopenClarification(items, action.toolCallId);
    case 'retract_last_user_message': {
      const index = items.map((item) => item.kind).lastIndexOf('user_message');
      return index === -1 ? items : items.filter((_, position) => position !== index);
    }
  }
};

const STREAM_INTERRUPTED_MESSAGE = 'A conexão com o servidor caiu no meio da resposta. Tente novamente.';

const EMPTY_PROMPT_WITH_ATTACHMENTS = 'Analise o arquivo anexado.';

const withoutOne = (prompts: string[], prompt: string) => {
  const index = prompts.indexOf(prompt);
  return index === -1 ? prompts : prompts.filter((_, position) => position !== index);
};

// A message sent to the running answer's queue: refused by the server, or left without an answer to follow
interface IQueueDelivery {
  prompt: string;
  refused: boolean;
  orphaned: boolean;
}

// The answer may read several queued messages at once, and then announces them in one event, one per line
const withoutTaken = (queue: string[], content: string) => content.split('\n').reduce(withoutOne, queue);

export const useChatStream = (
  chatId: UUID7,
  history: IChatHistory,
  modelName: string,
  restoreDraft: (text: string, files?: IChatFileRef[]) => void,
) => {
  const { data: me } = useMe();
  const queryClient = useQueryClient();
  // The server has the whole conversation: a newer history rebuilds the timeline and follows the answer still going
  const resync = () => void queryClient.invalidateQueries({ queryKey: chatMessagesQuery(chatId).queryKey });
  const [items, dispatch] = useReducer(timelineReducer, history.events, replay);
  const [isStreaming, setIsStreaming] = useState(false);
  const [queued, setQueued] = useState<string[]>([]);
  // Stream generation: unmounting (another chat, or a fresh history) invalidates the loops still running
  const generationRef = useRef(0);
  const queuedRef = useRef<string[]>([]);
  const deliveriesRef = useRef<IQueueDelivery[]>([]);

  useEffect(() => () => {
    generationRef.current += 1;
  }, []);

  const pendingClarification = findPendingClarification(items);

  const setQueue = (prompts: string[]) => {
    queuedRef.current = prompts;
    setQueued(prompts);
  };

  const follow = async (stream: ReadableStream<Uint8Array>, generation: number) => {
    let interrupted = false;
    let stopped = false;
    let completed = false;
    let question: string | undefined;
    try {
      for await (const event of parseChatStream(stream)) {
        if (generationRef.current !== generation) return;
        if (event.type === 'user_message' && event.queued) setQueue(withoutTaken(queuedRef.current, event.content));
        if (event.type === 'cancelled') stopped = true;
        if (event.type === 'done') completed = true;
        if (event.type === 'clarification') question = event.tool_call_id;
        dispatch({ type: 'event', event });
      }
    } catch {
      if (generationRef.current !== generation) return;
      interrupted = true;
      dispatch({ type: 'event', event: { type: 'error', content: clientError(STREAM_INTERRUPTED_MESSAGE) } });
    } finally {
      if (generationRef.current === generation) {
        // Closes the streaming bubble even if the backend ends without a done event
        dispatch({ type: 'event', event: { type: 'done' } });
        setIsStreaming(false);
        const deliveries = deliveriesRef.current;
        deliveriesRef.current = deliveries.filter((delivery) => !delivery.refused);
        // A dropped connection says nothing about the run, which may still take in what reached the server
        if (interrupted) {
          deliveries.forEach((delivery) => {
            delivery.orphaned = true;
          });
          giveBack(deliveries.filter((delivery) => delivery.refused).map((delivery) => delivery.prompt));
          resync();
        } else if (completed && !stopped) sendWhatTheAnswerDidNotTake(question);
        else giveBack(queuedRef.current);
      }
    }
  };

  const giveBack = (prompts: string[]) => {
    setQueue([]);
    if (prompts.length) restoreDraft(prompts.join(' '));
  };

  // An answer that ended on a question takes what was typed meanwhile as the reply to it
  const sendWhatTheAnswerDidNotTake = (question?: string) => {
    const leftovers = queuedRef.current;
    if (!leftovers.length) return;
    setQueue([]);
    void submitPrompt(leftovers.join('\n\n'), [], question).then((sent) => {
      if (!sent) restoreDraft(leftovers.join(' '));
    });
  };

  // False when the message never reached the server, so the caller can give it back
  const submitPrompt = async (
    prompt: string,
    attachments: IChatFileRef[] = [],
    answerToToolCallId?: string,
  ): Promise<boolean> => {
    const generation = ++generationRef.current;

    dispatch({ type: 'event', event: { type: 'user_message', content: prompt, files: attachments, sender: me ?? null } });
    setIsStreaming(true);

    let stream: ReadableStream<Uint8Array>;
    try {
      stream = await DatalabAPI.ChatMessagesResource.sendMessage(chatId, {
        prompt,
        ...(answerToToolCallId ? { answer_to_tool_call_id: answerToToolCallId } : {}),
        ...(attachments.length ? { file_ids: attachments.map((file) => file.id) } : {}),
        ...(modelName ? { model_name: modelName } : {}),
      });
    } catch (requestError) {
      if (generationRef.current !== generation) return false;
      // The POST failed before the stream started, so the message is undone and the clarification reopens
      dispatch({ type: 'retract_last_user_message' });
      if (answerToToolCallId) {
        dispatch({ type: 'reopen_clarification', toolCallId: answerToToolCallId });
      }
      dispatch({ type: 'event', event: { type: 'error', content: ApiError.from(requestError) } });
      setIsStreaming(false);
      resync();
      return false;
    }

    await follow(stream, generation);
    return true;
  };

  const queuePrompt = async (prompt: string) => {
    setQueue([...queuedRef.current, prompt]);
    const delivery: IQueueDelivery = { prompt, refused: false, orphaned: false };
    deliveriesRef.current = [...deliveriesRef.current, delivery];
    try {
      await DatalabAPI.ChatMessagesResource.queueMessage(chatId, prompt);
      deliveriesRef.current = deliveriesRef.current.filter((other) => other !== delivery);
    } catch {
      // It stays queued and goes out once the answer ends, or back to the input if the connection already dropped
      delivery.refused = true;
      if (delivery.orphaned) restoreDraft(prompt);
    }
  };

  const followActiveRun = useEffectEvent(async () => {
    if (!history.run_id) return;
    const generation = ++generationRef.current;
    const stream = await DatalabAPI.ChatMessagesResource.followRun(chatId, history.run_id).catch((requestError: unknown) => {
      if (generationRef.current === generation) {
        dispatch({ type: 'event', event: { type: 'error', content: ApiError.from(requestError) } });
      }
      return null;
    });
    if (!stream || generationRef.current !== generation) return;

    setIsStreaming(true);
    await follow(stream, generation);
  });

  useEffect(() => {
    void followActiveRun();
  }, []);

  const sendPrompt = async (prompt: string, attachments: IChatFileRef[] = []) => {
    const trimmedPrompt = prompt.trim();
    if (isStreaming) {
      if (trimmedPrompt) await queuePrompt(trimmedPrompt);
      return;
    }
    if (!trimmedPrompt && attachments.length === 0) return;

    // With a pending clarification, free text also answers it
    const sent = await submitPrompt(
      trimmedPrompt || EMPTY_PROMPT_WITH_ATTACHMENTS,
      attachments,
      pendingClarification?.toolCallId,
    );
    if (!sent) restoreDraft(trimmedPrompt, attachments);
  };

  const answerClarification = async (answer: string) => {
    if (!pendingClarification || isStreaming) return;
    await submitPrompt(answer, [], pendingClarification.toolCallId);
  };

  const stop = () => DatalabAPI.ChatMessagesResource.cancelRun(chatId).catch(() => undefined);

  return { items, isStreaming, queued, pendingClarification, sendPrompt, answerClarification, stop };
};
