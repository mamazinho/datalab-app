import { useEffect, useState, useRef, useCallback } from 'react';
import { DatalabAPI } from '../../../../services/datalab-api';
import { processStreamResponse, type IMessage } from '../../../../utils/process-stream';

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
        <div>
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
                        >{message.content}</div>
                    ))
                )}
                {messagesOnStreaming.length > 0 ?
                    messagesOnStreaming.map((message, index) => (
                        <div 
                            key={index}
                            className={`${message.role}`}
                            title={`${message.role} em ${new Date(message.timestamp).toLocaleString('pt-BR')}`}
                            >{message.content}</div>
                    )) : null
                }
            </div>
            {isLoading && (
                <div className="d-flex justify-content-center mb-3">
                    <div className={`spinner ${isLoading ? 'active' : ''}`} />
                        <p className="text-muted ms-3 align-self-center">
                            <em>IA está pensando...</em>
                        </p>
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="d-flex gap-2 align-items-end">
                    <div className="flex-grow-1">
                        <input
                            id="prompt-input"
                            name="prompt"
                            className="form-control"
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
                        className="btn btn-primary"
                        type="submit"
                        disabled={isDisabled || !prompt.trim()}
                    >
                        {isLoading ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                Enviando...
                            </>
                        ) : (
                            <>
                                <i className="bi bi-send me-1"></i>
                                Enviar
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    )
}