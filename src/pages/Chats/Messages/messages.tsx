import styles from './messages.module.css';
import { Suspense, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { ErrorBoundary, type FallbackProps } from 'react-error-boundary';
import { QueryErrorResetBoundary } from '@tanstack/react-query';
import { ChatConversation } from './components/chat-conversation';
import { ServerErrorComponent } from '../../../components/Feedback/ErrorBoundaries/server-error';
import { LoadingPiece } from '../../../components/Feedback/Loadings/loading';
import { isUuid7, type UUID7 } from '../../../types/ids';
import { ApiError } from '../../../utils/api-error';
import { useChat } from '../../../hooks/use-chat';
import { useChatMessages } from '../../../hooks/use-chat-messages';
import { useChatAttachments } from './use-chat-attachments';

// A missing or inaccessible chat (404) goes back to the list; other errors show the retry screen
const ChatErrorFallback = ({ error, resetErrorBoundary }: FallbackProps) => {
    if (ApiError.from(error).status === 404) {
        return <Navigate to="/ia/conversas" replace />;
    }
    return <ServerErrorComponent error={error} resetErrorBoundary={resetErrorBoundary} />;
};

const ChatView = ({ chatId }: { chatId: UUID7 }) => {
    const { data: chat } = useChat(chatId);
    const { data: history } = useChatMessages(chatId);
    // A history that changed on the refetch starts the timeline over
    const [shown, setShown] = useState({ history, version: 0 });
    if (shown.history !== history) setShown({ history, version: shown.version + 1 });
    // The draft outlives the timeline restarts: what was typed, attached or chosen stays while the timeline is rebuilt
    const [model, setModel] = useState('');
    const [prompt, setPrompt] = useState('');
    const attachments = useChatAttachments(chatId);

    return (
        <>
            <header className={styles.messagesHeader}>
                <h2 className={styles.messagesTitle}>{chat.title ?? 'Sem título'}</h2>
                <p className={styles.messagesSubtitle}>Converse com nossa IA e tire suas dúvidas</p>
            </header>

            <div className={styles.messagesBody}>
                <ChatConversation
                    key={shown.version}
                    chatId={chatId}
                    history={history}
                    model={model}
                    onModelChange={setModel}
                    prompt={prompt}
                    onPromptChange={setPrompt}
                    attachments={attachments}
                />
            </div>
        </>
    );
};

export const ChatMessages = () => {
    const { chatId } = useParams<{ chatId: string }>();

    if (!isUuid7(chatId)) return <Navigate to="/ia/conversas" replace />;

    return (
        <div className={styles.messagesContainer}>
            <QueryErrorResetBoundary>
                {({ reset }) => (
                    <ErrorBoundary FallbackComponent={ChatErrorFallback} onReset={reset}>
                        <Suspense fallback={<LoadingPiece />}>
                            <ChatView key={chatId} chatId={chatId} />
                        </Suspense>
                    </ErrorBoundary>
                )}
            </QueryErrorResetBoundary>
        </div>
    );
};
