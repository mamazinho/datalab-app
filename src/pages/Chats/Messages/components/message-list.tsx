import { useEffect, useRef } from 'react';
import { type IMessage } from '../../../../utils/process-stream';
import { MessageBubble } from './message-bubble';

interface IMessageListProps {
    messages: IMessage[];
    streamingMessages: IMessage[];
}

export const MessageList = ({ messages, streamingMessages }: IMessageListProps) => {
    const conversationRef = useRef<HTMLDivElement>(null);

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
                    {messages.map((message, index) => (
                        <MessageBubble key={`hist-${index}`} message={message} />
                    ))}
                    {streamingMessages.map((message, index) => (
                        <MessageBubble key={`stream-${index}`} message={message} />
                    ))}
                </>
            )}
        </div>
    );
};
