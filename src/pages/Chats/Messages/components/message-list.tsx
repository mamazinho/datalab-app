import { useEffect, useRef } from 'react';
import { type IMessage } from '../../../../utils/process-stream';
import { MessageBubble } from './message-bubble';

interface IMessageListProps {
    messages: IMessage[];
    streamingMessages: IMessage[];
}

interface IGroupedMessage {
    message: IMessage;
    internalMessages: IMessage[];
}

const isInternalMessage = (message: IMessage) => message.message_type !== 'chat';

const createInternalOnlyGroup = (internalMessages: IMessage[]): IGroupedMessage => {
    const lastInternalMessage = internalMessages[internalMessages.length - 1];

    return {
        message: {
            role: 'agent',
            actor_role: 'supervisor',
            message_type: 'chat',
            content: '',
            timestamp: lastInternalMessage.timestamp,
        },
        internalMessages,
    };
};

const mergeStreamContent = (previousContent: string, nextContent: string): string => {
    if (!previousContent) return nextContent;
    if (!nextContent) return previousContent;
    return nextContent.startsWith(previousContent) ? nextContent : `${previousContent}${nextContent}`;
};

const groupMessages = (allMessages: IMessage[]): IGroupedMessage[] => {
    const groupedMessages: IGroupedMessage[] = [];
    let pendingInternalMessages: IMessage[] = [];

    for (const message of allMessages) {
        if (isInternalMessage(message)) {
            pendingInternalMessages.push(message);
            continue;
        }

        const lastGroupedMessage = groupedMessages[groupedMessages.length - 1];
        const canMergeWithPreviousChat =
            !!lastGroupedMessage &&
            lastGroupedMessage.message.message_type === 'chat' &&
            lastGroupedMessage.message.role === message.role &&
            (
                message.role === 'agent' ||
                lastGroupedMessage.message.actor_role === message.actor_role
            );

        if (canMergeWithPreviousChat) {
            if (pendingInternalMessages.length > 0) {
                lastGroupedMessage.internalMessages = [
                    ...lastGroupedMessage.internalMessages,
                    ...pendingInternalMessages,
                ];
                pendingInternalMessages = [];
            }

            lastGroupedMessage.message = {
                ...message,
                content: mergeStreamContent(lastGroupedMessage.message.content, message.content),
            };
            continue;
        }

        groupedMessages.push({
            message,
            internalMessages: pendingInternalMessages,
        });
        pendingInternalMessages = [];
    }

    if (pendingInternalMessages.length > 0) {
        groupedMessages.push(createInternalOnlyGroup(pendingInternalMessages));
    }

    return groupedMessages;
};

export const MessageList = ({ messages, streamingMessages }: IMessageListProps) => {
    const conversationRef = useRef<HTMLDivElement>(null);
    const groupedMessages = groupMessages(messages);
    const groupedStreamingMessages = groupMessages(streamingMessages);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        if (conversationRef.current) {
            conversationRef.current.scrollTop = conversationRef.current.scrollHeight;
        }
    }, [messages, streamingMessages]);

    return (
        <div id="conversation" ref={conversationRef} className="flex-1 overflow-y-auto p-4 bg-gray-50 rounded-xl border border-gray-200 mb-4 space-y-4 shadow-inner">
            {messages.length === 0 && streamingMessages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-400 text-center animate-fade-in">
                    <p className="text-4xl mb-4">💬</p>
                    <p className="text-lg font-medium text-gray-500">Nenhuma mensagem ainda</p>
                    <p className="text-sm">Comece uma conversa digitando sua pergunta abaixo!</p>
                </div>
            ) : (
                <>
                    {groupedMessages.map(({ message, internalMessages }, index) => (
                        <MessageBubble key={`hist-${index}`} message={message} internalMessages={internalMessages} />
                    ))}
                    {groupedStreamingMessages.map(({ message, internalMessages }, index) => (
                        <MessageBubble key={`stream-${index}`} message={message} internalMessages={internalMessages} />
                    ))}
                </>
            )}
        </div>
    );
};
