import { useEffect, useRef } from 'react';
import type { TimelineItem } from '../../../../utils/chat-timeline';
import { MessageBubble } from './message-bubble';
import { ThreadBox } from './thread-box';
import { ClarificationCard } from './clarification-card';
import {
    Conversation,
    EmptyEmoji,
    EmptyState,
    EmptyText,
    EmptyTitle,
    ErrorLabel,
    StreamErrorBubble,
    StreamErrorRow,
} from '../messages.style';

interface IMessageListProps {
    items: TimelineItem[];
    isStreaming: boolean;
    onAnswerClarification: (answer: string) => void;
}

const renderItem = (
    item: TimelineItem,
    isStreaming: boolean,
    onAnswerClarification: (answer: string) => void,
) => {
    switch (item.kind) {
        case 'user_message':
            return <MessageBubble key={item.id} content={item.content} isUser />;
        case 'assistant_bubble':
            return <MessageBubble key={item.id} content={item.content} isUser={false} isStreaming={item.isStreaming} />;
        case 'thread_box':
            return <ThreadBox key={item.id} item={item} />;
        case 'clarification':
            return <ClarificationCard key={item.id} item={item} onAnswer={onAnswerClarification} disabled={isStreaming} />;
        case 'stream_error':
            return (
                <StreamErrorRow key={item.id}>
                    <StreamErrorBubble>
                        <ErrorLabel>Erro: </ErrorLabel>{item.content}
                    </StreamErrorBubble>
                </StreamErrorRow>
            );
    }
};

export const MessageList = ({ items, isStreaming, onAnswerClarification }: IMessageListProps) => {
    const conversationRef = useRef<HTMLDivElement>(null);

    // Auto-scroll para o fim quando chegam itens/deltas novos
    useEffect(() => {
        if (conversationRef.current) {
            conversationRef.current.scrollTop = conversationRef.current.scrollHeight;
        }
    }, [items]);

    return (
        <Conversation id="conversation" ref={conversationRef}>
            {items.length === 0 ? (
                <EmptyState>
                    <EmptyEmoji>💬</EmptyEmoji>
                    <EmptyTitle>Nenhuma mensagem ainda</EmptyTitle>
                    <EmptyText>Comece uma conversa digitando sua pergunta abaixo!</EmptyText>
                </EmptyState>
            ) : (
                items.map((item) => renderItem(item, isStreaming, onAnswerClarification))
            )}
        </Conversation>
    );
};
