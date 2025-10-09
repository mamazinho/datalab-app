import { useEffect, useState, useRef, useCallback } from 'react';
import { marked } from 'marked';
import { DatalabAPI, processStreamResponse, type IMessage } from '../../services/datalab-api';

interface IMessagesHistoryProps {
    chatId: number;
    onError: (error: unknown) => void;
}

export const Messages = ({ chatId, onError }: IMessagesHistoryProps) => {
    const conversationRef = useRef<HTMLDivElement>(null);
    const [messages, setMessages] = useState<IMessage[]>([]);
    const [isDisabled, setIsDisabled] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [prompt, setPrompt] = useState('');

    const addMessages = (newMessages: IMessage[]) => {
        setMessages(prevMessages => {
            const messageMap = new Map();
            console.log("bbbbb", prevMessages, newMessages);

            prevMessages.forEach(msg => messageMap.set(msg.timestamp, msg));
            newMessages.forEach(msg => messageMap.set(msg.timestamp, msg));

            return Array.from(messageMap.values()).sort((a, b) =>
                new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
            );
        });
    };

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

        DatalabAPI.sendMessage(Number(chatId), currentPrompt).
            then(async stream => {
                await processStreamResponse(stream, addMessages);
                setIsLoading(false);
                setIsDisabled(false);
            }).catch(error => {
                handleError(error);
            });
    };

    useEffect(() => {
        const fetchMessages = () => {
            DatalabAPI.getChatMessages(chatId).
                then(async stream => {
                    console.log("response", stream);
                    await processStreamResponse(stream, addMessages)
                }).catch(error => {
                    console.error("Error fetching messages:", error);
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
    }, [messages]);

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
                            dangerouslySetInnerHTML={{
                                __html: message.content ? marked.parse(message.content) : ''
                            }}
                        />
                    ))
                )}
            </div>
            <div className="d-flex justify-content-center mb-3">
                <div className={`spinner ${isLoading ? 'active' : ''}`} />
                {isLoading && (
                    <p className="text-muted ms-3 align-self-center">
                        <em>IA está pensando...</em>
                    </p>
                )}
            </div>

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