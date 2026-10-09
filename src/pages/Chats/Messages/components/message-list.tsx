import { useEffect, useRef } from 'react';
import type { TimelineItem } from '../../../../utils/chat-timeline';
import type { UUID7 } from '../../../../types/ids';
import { MessageBubble } from './message-bubble';
import { ThreadBox } from './thread-box';
import { ClarificationCard } from './clarification-card';
import { FileCard } from './file-card';
import { AttachmentChip } from './attachment-chip';
import {
    AttachmentsInBubble,
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
    chatId: UUID7;
    items: TimelineItem[];
    isStreaming: boolean;
    onAnswerClarification: (answer: string) => void;
}

const renderItem = (
    chatId: UUID7,
    item: TimelineItem,
    isStreaming: boolean,
    onAnswerClarification: (answer: string) => void,
) => {
    switch (item.kind) {
        case 'user_message':
            return (
                <MessageBubble key={item.id} content={item.content} isUser>
                    {item.attachments.length > 0 && (
                        <AttachmentsInBubble>
                            {item.attachments.map((file) => (
                                <AttachmentChip key={file.id} filename={file.filename} size={file.size} />
                            ))}
                        </AttachmentsInBubble>
                    )}
                </MessageBubble>
            );
        case 'assistant_bubble':
            return (
                <MessageBubble key={item.id} content={item.content} isUser={false} isStreaming={item.isStreaming}>
                    {item.files.map((file) => <FileCard key={file.id} chatId={chatId} file={file} />)}
                </MessageBubble>
            );
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

export const MessageList = ({ chatId, items, isStreaming, onAnswerClarification }: IMessageListProps) => {
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
                items.map((item) => renderItem(chatId, item, isStreaming, onAnswerClarification))
            )}
        </Conversation>
    );
};
