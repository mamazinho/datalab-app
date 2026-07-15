import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChatConversation } from './components/chat-conversation';
import { AsyncResource } from '../../../components/Tools/async-resource';
import { DatalabAPI } from '../../../services/datalab-api';
import type { IChatMessageRead } from '../../../services/datalab-api/chatMessagesResource';
import { ErrorBanner, ErrorLabel, MessagesBody, MessagesContainer, MessagesHeader, MessagesSubtitle, MessagesTitle, MessagesTitleHighlight } from './messages.style';
import { useChatsContext } from '../../../contexts/chats';

export const ChatMessages: React.FC = () => {
    const { chatId } = useParams<{ chatId: string }>();
    const navigate = useNavigate();
    const { chats, getAllChats } = useChatsContext();
    const createdFallbackForChatIdRef = useRef<string | null>(null);

    const [error, setError] = useState<string | null>(null);
    const [isValidatingChat, setIsValidatingChat] = useState(true);

    const handleError = useCallback((error: unknown) => {
        console.error(error);
        setError('Ocorreu um erro, verifique o console do navegador para mais informações.');
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
                        navigate(`/ia/conversas/${createdChat.id}/mensagens`, { replace: true });
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

    const fetchMessages = useCallback(async (): Promise<IChatMessageRead[]> => {
        if (!chatId || isValidatingChat) return [];

        return DatalabAPI.ChatMessagesResource.getChatMessages(Number(chatId));
    }, [chatId, isValidatingChat]);

    return (
        <MessagesContainer>
            <MessagesHeader>
                <MessagesTitle>Chat <MessagesTitleHighlight>#{chatId}</MessagesTitleHighlight></MessagesTitle>
                <MessagesSubtitle>Converse com nossa IA e tire suas dúvidas</MessagesSubtitle>
            </MessagesHeader>

            <MessagesBody>
                <AsyncResource fetcher={fetchMessages} dependencies={[chatId, isValidatingChat]}>
                    {(history) => (
                        <ChatConversation chatId={Number(chatId)} history={history} />
                    )}
                </AsyncResource>
            </MessagesBody>

            {error && (
                <ErrorBanner>
                    <ErrorLabel>Erro:</ErrorLabel> {error}
                </ErrorBanner>
            )}
        </MessagesContainer>
    );
};
