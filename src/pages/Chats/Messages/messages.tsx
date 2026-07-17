import React from 'react';
import { useParams } from 'react-router-dom';
import { ChatConversation } from './components/chat-conversation';
import { AsyncResource } from '../../../components/Tools/async-resource';
import { DatalabAPI } from '../../../services/datalab-api';
import type { IChatMessageRead } from '../../../services/datalab-api/chatMessagesResource';
import { useEnsureChat } from './use-ensure-chat';
import { ErrorBanner, ErrorLabel, MessagesBody, MessagesContainer, MessagesHeader, MessagesSubtitle, MessagesTitle, MessagesTitleHighlight } from './messages.style';

export const ChatMessages: React.FC = () => {
    const { chatId } = useParams<{ chatId: string }>();
    const { isValidatingChat, validationError } = useEnsureChat(chatId);

    const fetchMessages = async (): Promise<IChatMessageRead[]> => {
        if (!chatId || isValidatingChat) return [];

        return DatalabAPI.ChatMessagesResource.getChatMessages(Number(chatId));
    };

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

            {validationError && (
                <ErrorBanner>
                    <ErrorLabel>Erro:</ErrorLabel> {validationError}
                </ErrorBanner>
            )}
        </MessagesContainer>
    );
};
