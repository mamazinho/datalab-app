import { useLayoutEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supervisorQuery } from '../../../../queries';
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
    ConversationViewport,
    EmptyEmoji,
    EmptyState,
    EmptyText,
    EmptyTitle,
    ErrorLabel,
    ScrollToBottomButton,
    StreamErrorBubble,
    StreamErrorRow,
} from '../messages.style';

interface IMessageListProps {
    chatId: UUID7;
    items: TimelineItem[];
    isStreaming: boolean;
    onAnswerClarification: (answer: string) => void;
}

const NEAR_BOTTOM_PX = 64;

const isNearBottom = ({ scrollHeight, scrollTop, clientHeight }: HTMLElement) =>
    scrollHeight - scrollTop - clientHeight <= NEAR_BOTTOM_PX;

const scrollToBottom = (element: HTMLElement | null, behavior?: ScrollBehavior) =>
    element?.scrollTo({ top: element.scrollHeight, behavior });

const authorKey = (item: TimelineItem | undefined) => {
    if (item?.kind === 'user_message') return `user:${item.sender?.name}`;
    if (item?.kind === 'assistant_bubble' || item?.kind === 'clarification') return 'assistant';
    return item?.kind;
};

export const MessageList = ({ chatId, items, isStreaming, onAnswerClarification }: IMessageListProps) => {
    const { data: supervisor } = useQuery(supervisorQuery);
    const assistant = supervisor ?? null;
    const conversationRef = useRef<HTMLDivElement>(null);
    const [isScrolledUp, setIsScrolledUp] = useState(false);
    const lastUserMessageId = items.filter((item) => item.kind === 'user_message').at(-1)?.id;

    useLayoutEffect(() => {
        if (!isScrolledUp) scrollToBottom(conversationRef.current);
    }, [items, isScrolledUp]);

    useLayoutEffect(() => {
        scrollToBottom(conversationRef.current);
    }, [lastUserMessageId]);

    const renderItem = (item: TimelineItem, index: number) => {
        const showAuthor = authorKey(item) !== authorKey(items[index - 1]);

        switch (item.kind) {
            case 'user_message':
                return (
                    <MessageBubble
                        key={item.id}
                        content={item.content}
                        isUser
                        author={item.sender}
                        showAuthor={showAuthor}
                        createdAt={item.createdAt}
                    >
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
                    <MessageBubble
                        key={item.id}
                        content={item.content}
                        isUser={false}
                        author={assistant}
                        showAuthor={showAuthor}
                        createdAt={item.createdAt}
                        isStreaming={item.isStreaming}
                    >
                        {item.files.map((file) => <FileCard key={file.id} chatId={chatId} file={file} />)}
                    </MessageBubble>
                );
            case 'thread_box':
                return <ThreadBox key={item.id} item={item} />;
            case 'clarification':
                return <ClarificationCard
                        key={item.id}
                        item={item}
                        author={assistant}
                        showAuthor={showAuthor}
                        onAnswer={onAnswerClarification}
                        disabled={isStreaming}
                    />;
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

    return (
        <ConversationViewport>
            <Conversation
                ref={conversationRef}
                role="region"
                aria-label="Mensagens"
                onScroll={(event) => setIsScrolledUp(!isNearBottom(event.currentTarget))}
            >
                {items.length === 0 ? (
                    <EmptyState>
                        <EmptyEmoji>💬</EmptyEmoji>
                        <EmptyTitle>Nenhuma mensagem ainda</EmptyTitle>
                        <EmptyText>Comece uma conversa digitando sua pergunta abaixo!</EmptyText>
                    </EmptyState>
                ) : (
                    items.map(renderItem)
                )}
            </Conversation>
            {isScrolledUp && (
                <ScrollToBottomButton
                    type="button"
                    aria-label="Ir para a última mensagem"
                    title="Ir para a última mensagem"
                    onClick={() => scrollToBottom(conversationRef.current, 'smooth')}
                >
                    <svg
                        viewBox="0 0 24 24"
                        width="18"
                        height="18"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                    >
                        <path d="M12 5v14M5 12l7 7 7-7" />
                    </svg>
                </ScrollToBottomButton>
            )}
        </ConversationViewport>
    );
};
