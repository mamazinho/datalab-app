import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DatalabAPI } from '../../../services/datalab-api';
import { useChatsContext } from '../../../contexts/chats';

/**
 * Garante que o chat da rota existe: valida o id, auto-cria um chat quando o id
 * não pertence ao usuário e redireciona para ele. É um efeito com navegação e
 * criação — não uma leitura de dados — por isso vive num useEffect.
 */
export const useEnsureChat = (chatId: string | undefined) => {
    const navigate = useNavigate();
    const { chats, getAllChats } = useChatsContext();
    const createdFallbackForChatIdRef = useRef<string | null>(null);

    const [isValidatingChat, setIsValidatingChat] = useState(true);
    const [validationError, setValidationError] = useState<string | null>(null);

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
                    setValidationError('ID de conversa inválido.');
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
                    setValidationError(null);
                }
            } catch (error: unknown) {
                console.error(error);
                if (isActive) {
                    setValidationError('Ocorreu um erro, verifique o console do navegador para mais informações.');
                }
            } finally {
                if (isActive) {
                    setIsValidatingChat(false);
                }
                isActive = false;
            }
        };

        void ensureCurrentChatExists();
    }, [chatId, chats, getAllChats, navigate]);

    return { isValidatingChat, validationError };
};
