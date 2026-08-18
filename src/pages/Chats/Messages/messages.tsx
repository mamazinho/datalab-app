import { Suspense } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { ErrorBoundary, type FallbackProps } from 'react-error-boundary';
import { QueryErrorResetBoundary } from '@tanstack/react-query';
import { ChatConversation } from './components/chat-conversation';
import { ServerErrorComponent } from '../../../components/Feedback/ErrorBoundaries/server-error';
import { LoadingPiece } from '../../../components/Feedback/Loadings/loading';
import { isUuid, type UUID } from '../../../types/ids';
import { useChat } from '../../../hooks/use-chat';
import { useChatMessages } from '../../../hooks/use-chat-messages';
import { MessagesBody, MessagesContainer, MessagesHeader, MessagesSubtitle, MessagesTitle } from './messages.style';

// Chat inexistente / de outro usuário (404) manda de volta para a lista;
// os demais erros seguem para a tela padrão de erro com "Tentar novamente".
const ChatErrorFallback = ({ error, resetErrorBoundary }: FallbackProps) => {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
        return <Navigate to="/ia/conversas" replace />;
    }
    return <ServerErrorComponent error={error} resetErrorBoundary={resetErrorBoundary} />;
};

const ChatView = ({ chatId }: { chatId: UUID }) => {
    const { data: chat } = useChat(chatId);
    const { data: history } = useChatMessages(chatId);

    return (
        <>
            <MessagesHeader>
                <MessagesTitle>{chat.title}</MessagesTitle>
                <MessagesSubtitle>Converse com nossa IA e tire suas dúvidas</MessagesSubtitle>
            </MessagesHeader>

            <MessagesBody>
                <ChatConversation chatId={chatId} history={history} />
            </MessagesBody>
        </>
    );
};

export const ChatMessages = () => {
    const { chatId } = useParams<{ chatId: string }>();

    if (!isUuid(chatId)) return <Navigate to="/ia/conversas" replace />;

    return (
        <MessagesContainer>
            <QueryErrorResetBoundary>
                {({ reset }) => (
                    <ErrorBoundary FallbackComponent={ChatErrorFallback} onReset={reset}>
                        <Suspense fallback={<LoadingPiece />}>
                            <ChatView chatId={chatId} />
                        </Suspense>
                    </ErrorBoundary>
                )}
            </QueryErrorResetBoundary>
        </MessagesContainer>
    );
};
