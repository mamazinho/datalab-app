import { useEffect, useMemo, useRef } from 'react';
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
const isChatMessage = (message: IMessage) => message.message_type === 'chat';
const isUserSender = (message: IMessage) => message.sender === 'user';
const getLastGroup = (groupedMessages: IGroupedMessage[]) => groupedMessages[groupedMessages.length - 1];

const createInternalOnlyGroup = (internalMessages: IMessage[]): IGroupedMessage => {
    const lastInternalMessage = internalMessages[internalMessages.length - 1];

    return {
        message: {
            sender: 'supervisor',
            receiver: 'user',
            message_type: 'chat',
            content: '',
            timestamp: lastInternalMessage.timestamp,
            specialist_key: lastInternalMessage.specialist_key,
        },
        internalMessages,
    };
};

const mergeStreamContent = (previousContent: string, nextContent: string): string => {
    if (!previousContent) return nextContent;
    if (!nextContent) return previousContent;
    return nextContent.startsWith(previousContent) ? nextContent : `${previousContent}${nextContent}`;
};

const canMergeInternalMessage = (lastInternalMessage: IMessage | undefined, currentMessage: IMessage): boolean => {
    if (!lastInternalMessage) return false;

    return (
        lastInternalMessage.sender === currentMessage.sender &&
        lastInternalMessage.receiver === currentMessage.receiver &&
        lastInternalMessage.message_type === currentMessage.message_type
    );
};

const pushOrMergeInternalMessage = (pendingInternalMessages: IMessage[], currentMessage: IMessage): IMessage[] => {
    const lastInternalMessage = pendingInternalMessages[pendingInternalMessages.length - 1];

    if (!canMergeInternalMessage(lastInternalMessage, currentMessage)) {
        return [...pendingInternalMessages, currentMessage];
    }

    return [
        ...pendingInternalMessages.slice(0, -1),
        {
            ...currentMessage,
            content: mergeStreamContent(lastInternalMessage.content, currentMessage.content),
        },
    ];
};

const canMergeWithLastChatGroup = (
    lastGroupedMessage: IGroupedMessage | undefined,
    currentMessage: IMessage,
): boolean => {
    if (!lastGroupedMessage || !isChatMessage(currentMessage)) return false;

    if (!isChatMessage(lastGroupedMessage.message)) return false;
    if (lastGroupedMessage.message.sender !== currentMessage.sender) return false;

    return (
        !isUserSender(currentMessage) ||
        lastGroupedMessage.message.receiver === currentMessage.receiver
    );
};

const mergeIntoLastGroup = (
    lastGroupedMessage: IGroupedMessage,
    currentMessage: IMessage,
    pendingInternalMessages: IMessage[],
) => {
    if (pendingInternalMessages.length > 0) {
        lastGroupedMessage.internalMessages = [
            ...lastGroupedMessage.internalMessages,
            ...pendingInternalMessages,
        ];
    }

    lastGroupedMessage.message = {
        ...currentMessage,
        content: mergeStreamContent(lastGroupedMessage.message.content, currentMessage.content),
    };
};

const createChatGroup = (message: IMessage, pendingInternalMessages: IMessage[]): IGroupedMessage => ({
    message,
    internalMessages: pendingInternalMessages,
});

const groupMessages = (allMessages: IMessage[]): IGroupedMessage[] => {
    const groupedMessages: IGroupedMessage[] = [];
    let pendingInternalMessages: IMessage[] = [];

    for (const message of allMessages) {
        if (isInternalMessage(message)) {
            pendingInternalMessages = pushOrMergeInternalMessage(pendingInternalMessages, message);
            continue;
        }

        const lastGroupedMessage = getLastGroup(groupedMessages);
        const canMergeWithPreviousChat = canMergeWithLastChatGroup(lastGroupedMessage, message);

        if (canMergeWithPreviousChat && lastGroupedMessage) {
            mergeIntoLastGroup(lastGroupedMessage, message, pendingInternalMessages);
            pendingInternalMessages = [];
            continue;
        }

        groupedMessages.push(createChatGroup(message, pendingInternalMessages));
        pendingInternalMessages = [];
    }

    if (pendingInternalMessages.length > 0) {
        groupedMessages.push(createInternalOnlyGroup(pendingInternalMessages));
    }

    return groupedMessages;
};

export const MessageList = ({ messages, streamingMessages }: IMessageListProps) => {
    const conversationRef = useRef<HTMLDivElement>(null);
    const groupedMessages = useMemo(() => groupMessages(messages), [messages]);
    const groupedStreamingMessages = useMemo(() => groupMessages(streamingMessages), [streamingMessages]);

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
