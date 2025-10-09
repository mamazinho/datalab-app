import { useEffect, useRef } from 'react';
import { marked } from 'marked';
import { DatalabAPI, processStreamResponse, type IMessage } from '../../services/datalab-api';

interface IMessagesHistoryProps {
    chatId: number;
    messages: IMessage[];
    onMessage: (messages: IMessage[]) => void;
}

export const MessagesHistory = ({ chatId, messages, onMessage }: IMessagesHistoryProps) => {
    const conversationRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        DatalabAPI.getChatMessages(chatId).
            then(async data => {
                console.log("response", data);
                await processStreamResponse(data, onMessage)
            }).catch(error => {
                console.error("Error fetching messages:", error);
            });
    }, [chatId]);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        if (conversationRef.current) {
            conversationRef.current.scrollTop = conversationRef.current.scrollHeight;
        }
    }, [messages]);

    return (
        <div id="conversation" ref={conversationRef}>
            {messages.length === 0 ? (
                <div className="text-center text-muted py-5">
                    <h5>💬 Nenhuma mensagem ainda</h5>
                    <p>Comece uma conversa digitando sua pergunta abaixo!</p>
                </div>
            ) : (
                messages.map((message, index) => (
                    <div
                        key={index}
                        className={`${message.role}`}
                        title={`${message.role} em ${new Date(message.timestamp).toLocaleString('pt-BR')}`}
                        dangerouslySetInnerHTML={{
                            __html: message.content ? marked.parse(message.content) : ''
                        }}
                    />
                ))
            )}
        </div>
    )
}