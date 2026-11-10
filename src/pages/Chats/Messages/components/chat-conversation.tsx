import { useState } from 'react';
import type { IChatStreamEvent } from '../../../../services/datalab-api/chatMessagesResource';
import type { UUID7 } from '../../../../types/ids';
import { useMe } from '../../../../hooks/use-me';
import { ModelMenu } from '../../../../components/UI/ModelMenu';
import { useChatAttachments } from '../use-chat-attachments';
import { useChatStream } from '../use-chat-stream';
import { MessageList } from './message-list';
import { MessageInput } from './message-input';

interface ChatConversationProps {
    chatId: UUID7;
    history: IChatStreamEvent[];
    model: string;
    onModelChange: (model: string) => void;
}

const placeholderFor = (isStreaming: boolean, isClarifying: boolean): string | undefined => {
    if (isStreaming) return 'Escreva para complementar a resposta...';
    if (isClarifying) return 'Responda à pergunta acima ou escolha uma das opções...';
    return undefined;
};

export const ChatConversation = ({ chatId, history, model, onModelChange }: ChatConversationProps) => {
    const { items, isStreaming, queued, pendingClarification, sendPrompt, answerClarification, stop } =
        useChatStream(chatId, history);
    const { attachments, readyFiles, isUploading, addFiles, remove, clear } = useChatAttachments(chatId);
    const [prompt, setPrompt] = useState('');
    const { data: me } = useMe();

    const canAttach = !pendingClarification && !isStreaming;
    const canSubmit = (prompt.trim().length > 0 || (readyFiles.length > 0 && !isStreaming)) && !isUploading;

    const handleSubmit = () => {
        if (!canSubmit) return;

        const currentPrompt = prompt;
        const currentFiles = readyFiles;
        setPrompt('');
        clear();
        void sendPrompt(currentPrompt, currentFiles, model);
    };

    return (
        <>
            <MessageList
                chatId={chatId}
                items={items}
                isStreaming={isStreaming}
                onAnswerClarification={(answer) => void answerClarification(answer)}
            />
            <MessageInput
                value={prompt}
                onChange={setPrompt}
                onSubmit={handleSubmit}
                isStreaming={isStreaming}
                onStop={() => void stop()}
                queued={queued}
                modelMenu={me?.role === 'admin' && <ModelMenu value={model} onChange={onModelChange} />}
                placeholder={placeholderFor(isStreaming, Boolean(pendingClarification))}
                attachments={attachments}
                onAttach={(files) => void addFiles(files)}
                onRemoveAttachment={remove}
                canAttach={canAttach}
                canSubmit={canSubmit}
            />
        </>
    );
};
