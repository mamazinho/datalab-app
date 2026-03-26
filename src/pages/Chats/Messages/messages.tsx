import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MessageList } from './components/message-list';
import { MessageInput } from './components/message-input';
import { AsyncResource } from '../../../components/Tools/async-resource';
import { DatalabAPI } from '../../../services/datalab-api';
import { processStreamResponse, type IMessage } from '../../../utils/process-stream';
import { ErrorBanner, ErrorLabel, MessagesBody, MessagesContainer, MessagesHeader, MessagesSubtitle, MessagesTitle, MessagesTitleHighlight } from './messages.style';
import { useChatsContext } from '../../../contexts/chats';

export const ChatMessages: React.FC = () => {
    const { chatId } = useParams<{ chatId: string }>();
    const navigate = useNavigate();
    const { chats, getAllChats } = useChatsContext();
    const latestStreamMessagesRef = useRef<IMessage[]>([]);
    const createdFallbackForChatIdRef = useRef<string | null>(null);

    const [error, setError] = useState<string | null>(null);
    const [appendedMessages, setAppendedMessages] = useState<IMessage[]>([]);
    const [streamingMessages, setStreamingMessages] = useState<IMessage[]>([]);
    const [isDisabled, setIsDisabled] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isValidatingChat, setIsValidatingChat] = useState(true);
    const [prompt, setPrompt] = useState('');
    const [selectedModel, setSelectedModel] = useState('');

    const handleError = useCallback((error: unknown) => {
        console.error(error);
        setError('Error occurred, check the browser developer console for more information.');
        setIsDisabled(false);
        setIsLoading(false);
    }, []);

    const streamingMessage = useCallback(async (newMessages: IMessage[]) => {
        if (!newMessages.length) return;

        const lastMessage = newMessages[newMessages.length - 1];
        console.log("Streaming completed, lastMessage:", lastMessage);
        latestStreamMessagesRef.current = newMessages;
        setStreamingMessages(newMessages);
    }, []);

    const streamingCompleted = useCallback(async () => {
        const consolidatedMessages = latestStreamMessagesRef.current;
        console.log("Streaming completed, final messages:", consolidatedMessages);
        setAppendedMessages((prevAppendedMessages) => [...prevAppendedMessages, ...consolidatedMessages]);
        setStreamingMessages([]);
        latestStreamMessagesRef.current = [];
    }, []);

    useEffect(() => {
        let isActive = true;

        const ensureCurrentChatExists = async () => {
            if (!chatId) {
                if (isActive) {
                    setIsValidatingChat(false);
                }
                return;
            }

            setIsValidatingChat(true);

            const routeChatId = Number(chatId);
            if (!Number.isFinite(routeChatId)) {
                if (isActive) {
                    setError('ID de conversa inválido.');
                    setIsValidatingChat(false);
                }
                return;
            }

            try {
                let contextChats = chats;

                if (!contextChats.length) {
                    contextChats = await getAllChats();
                }

                const hasCurrentChat = contextChats.some((chat) => chat.id === routeChatId);

                if (!hasCurrentChat) {
                    if (createdFallbackForChatIdRef.current === chatId) {
                        return;
                    }

                    createdFallbackForChatIdRef.current = chatId;

                    const createdChat = await DatalabAPI.ChatsResource.createChat({
                        title: 'Nova conversa - Sem título',
                    });

                    await getAllChats();

                    if (isActive) {
                        isActive = false;
                        navigate(`/conversas/${createdChat.id}/mensagens`, { replace: true });
                    }
                }

                if (isActive) {
                    createdFallbackForChatIdRef.current = null;
                    setError(null);
                }
            } catch (validationError: unknown) {
                if (isActive) {
                    handleError(validationError);
                }
            } finally {
                if (isActive) {
                    setIsValidatingChat(false);
                }
                isActive = false;
            }
        };

        ensureCurrentChatExists();
    }, [chatId, chats, getAllChats, navigate, handleError]);

    const fetchMessages = useCallback(async (): Promise<IMessage[]> => {
        if (!chatId || isValidatingChat) return [];

        setAppendedMessages([]);
        setStreamingMessages([]);
        latestStreamMessagesRef.current = [];

        const stream = await DatalabAPI.ChatMessagesResource.getChatMessages(Number(chatId));
        let finalMessages: IMessage[] = [];

        await processStreamResponse(stream, (newMessages) => {
            finalMessages = [...newMessages];
        });

        return finalMessages;
    }, [chatId, isValidatingChat]);

    const handleSendMessage = async () => {
        if (!prompt.trim() || !chatId || !selectedModel) return;
        setIsLoading(true);
        setIsDisabled(true);
        setError(null);

        const currentPrompt = prompt;
        setPrompt('');

        try {
            const stream = await DatalabAPI.ChatMessagesResource.sendMessage(Number(chatId), currentPrompt, selectedModel);
            await processStreamResponse(stream, streamingMessage, streamingCompleted);
        } catch (error) {
            handleError(error);
        } finally {
            setIsLoading(false);
            setIsDisabled(false);
        }
    };

    return (
        <MessagesContainer>
            <MessagesHeader>
                <MessagesTitle>Chat <MessagesTitleHighlight>#{chatId}</MessagesTitleHighlight></MessagesTitle>
                <MessagesSubtitle>Converse com nossa IA e tire suas dúvidas</MessagesSubtitle>
            </MessagesHeader>

            <MessagesBody>
                <AsyncResource fetcher={fetchMessages} dependencies={[chatId, isValidatingChat]}>
                    {(initialMessages) => (
                        <MessageList
                            messages={[...initialMessages, ...appendedMessages]}
                            streamingMessages={streamingMessages}
                        />
                    )}
                </AsyncResource>
            </MessagesBody>

            {error && (
                <ErrorBanner>
                    <ErrorLabel>Error:</ErrorLabel> {error}
                </ErrorBanner>
            )}

            <MessageInput
                value={prompt}
                modelName={selectedModel}
                onModelChange={setSelectedModel}
                onChange={setPrompt}
                onSubmit={handleSendMessage}
                isLoading={isLoading}
                isDisabled={isDisabled}
            />
        </MessagesContainer>
    );
};

