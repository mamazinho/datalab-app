import { useEffect, useState, useRef, useCallback } from 'react';
import { DatalabAPI } from '../../../../services/datalab-api';
import { processStreamResponse, type IMessage } from '../../../../utils/process-stream';
import { MessageBubble } from './message-bubble';

interface IMessagesHistoryProps {
    chatId: number;
    onError: (error: unknown) => void;
}

export const Messages = ({ chatId, onError }: IMessagesHistoryProps) => {
    const conversationRef = useRef<HTMLDivElement>(null);
    const mapMessagesByRole = useRef(new Map<string, IMessage>());

    const [messages, setMessages] = useState<IMessage[]>([]);
    const [messagesOnStreaming, setMessagesOnStreaming] = useState<IMessage[]>([]);
    const [isDisabled, setIsDisabled] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [prompt, setPrompt] = useState('');

    const streamingMessage = async (newMessages: IMessage[]) => {
        console.log("streamingMessage", newMessages);

        const lastRole = newMessages[newMessages.length - 1]?.role;
        mapMessagesByRole.current.set(lastRole, newMessages[newMessages.length - 1]);

        const allNewMessages = Array.from(mapMessagesByRole.current.values());
        setMessagesOnStreaming(allNewMessages);
    }

    const streamingCompleted = async () => {
        console.log("streamingCompleted");
        setMessagesOnStreaming((streamedMessages) => {
            const combinedMessages = [...messages, ...streamedMessages];
            setMessages(combinedMessages);
            return [];
        })
        mapMessagesByRole.current.clear();
    }

    const handleError = useCallback((error: unknown) => {
        console.error(error);
        onError(error);
        setIsDisabled(false);
        setIsLoading(false);
    }, [onError]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);

        const currentPrompt = prompt;
        setPrompt('');
        setIsDisabled(true);

        DatalabAPI.ChatMessagesResource.sendMessage(Number(chatId), currentPrompt).
            then(async stream => {
                await processStreamResponse(stream, streamingMessage, streamingCompleted);
                setIsLoading(false);
                setIsDisabled(false);
            }).catch(error => {
                handleError(error);
            });
    };

    useEffect(() => {
        const fetchMessages = () => {
            DatalabAPI.ChatMessagesResource.getChatMessages(chatId).
                then(async stream => {
                    await processStreamResponse(stream, (newMessages) => {setMessages([...newMessages])});
                }).catch(error => {
                    handleError(error);
                });
        };
        fetchMessages();
    }, [chatId, handleError]);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        if (conversationRef.current) {
            conversationRef.current.scrollTop = conversationRef.current.scrollHeight;
        }
    }, [messages, messagesOnStreaming]);

    return (
        <div className="flex flex-col h-full max-h-[calc(100vh-14rem)]">
            <div id="conversation" ref={conversationRef} className="flex-1 overflow-y-auto p-4 bg-gray-50 rounded-xl border border-gray-200 mb-4 space-y-4 shadow-inner">
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400 text-center animate-fade-in">
                        <p className="text-4xl mb-4">💬</p>
                        <p className="text-lg font-medium text-gray-500">Nenhuma mensagem ainda</p>
                        <p className="text-sm">Comece uma conversa digitando sua pergunta abaixo!</p>
                    </div>
                ) : (
                    messages.map((message, index) => (
                        <MessageBubble key={`hist-${index}`} message={message} />
                    ))
                )}
                {messagesOnStreaming.length > 0 ?
                    messagesOnStreaming.map((message, index) => (
                        <MessageBubble key={`hist-${index}`} message={message} />
                    )) : null
                }
            </div>
            {isLoading && (
                <div className="flex items-center gap-2 text-orange-600 text-sm font-medium mb-2 px-2 animate-pulse">
                    <div className="animate-spin h-4 w-4 border-2 border-orange-600 border-t-transparent rounded-full" />
                        <p>
                            <em>IA está pensando...</em>
                        </p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="bg-white p-2 rounded-xl border border-gray-100 shadow-sm">
                <div className="flex gap-2">
                    <div className="flex-1">
                        <input
                            id="prompt-input"
                            name="prompt"
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all placeholder-gray-400 text-gray-700 disabled:bg-gray-100 disabled:text-gray-400"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            disabled={isDisabled}
                            placeholder="Digite sua mensagem aqui..."
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey && !isDisabled && prompt.trim()) {
                                    e.preventDefault();
                                    const form = e.currentTarget.closest('form');
                                    if (form) {
                                        const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
                                        form.dispatchEvent(submitEvent);
                                    }
                                }
                            }}
                        />
                    </div>
                    <button
                        className="px-6 py-3 bg-orange-600 text-white font-semibold rounded-xl hover:bg-orange-700 disabled:bg-orange-300 disabled:cursor-not-allowed transition-all shadow-md active:scale-95 flex items-center justify-center min-w-30"
                        type="submit"
                        disabled={isDisabled || !prompt.trim()}
                    >
                        {isLoading ? (
                            <>
                                <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" role="status" aria-hidden="true"></span>
                                Enviando...
                            </>
                        ) : (
                            <>
                                <span className="mr-2">➤</span>
                                Enviar
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    )
}