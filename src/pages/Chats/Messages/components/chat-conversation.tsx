import { useState } from 'react';
import type { IChatMessageRead } from '../../../../services/datalab-api/chatMessagesResource';
import type { UUID7 } from '../../../../types/ids';
import { useChatAttachments } from '../use-chat-attachments';
import { useChatStream } from '../use-chat-stream';
import { MessageList } from './message-list';
import { MessageInput } from './message-input';

interface ChatConversationProps {
    chatId: UUID7;
    history: IChatMessageRead[];
    showSenders: boolean;
}

export const ChatConversation = ({ chatId, history, showSenders }: ChatConversationProps) => {
    const { items, isStreaming, pendingClarification, sendPrompt, answerClarification } =
        useChatStream(chatId, history);
    const { attachments, readyFiles, isUploading, addFiles, remove, clear } = useChatAttachments(chatId);
    const [prompt, setPrompt] = useState('');

    const canAttach = !pendingClarification;
    const canSubmit = (prompt.trim().length > 0 || readyFiles.length > 0) && !isUploading;

    const handleSubmit = () => {
        if (!canSubmit || isStreaming) return;

        const currentPrompt = prompt;
        const currentFiles = readyFiles;
        setPrompt('');
        clear();
        void sendPrompt(currentPrompt, currentFiles);
    };

    return (
        <>
            <MessageList
                chatId={chatId}
                items={items}
                isStreaming={isStreaming}
                showSenders={showSenders}
                onAnswerClarification={(answer) => void answerClarification(answer)}
            />
            <MessageInput
                value={prompt}
                onChange={setPrompt}
                onSubmit={handleSubmit}
                isLoading={isStreaming}
                isDisabled={isStreaming}
                placeholder={pendingClarification
                    ? 'Responda à pergunta acima ou escolha uma das opções...'
                    : undefined}
                attachments={attachments}
                onAttach={(files) => void addFiles(files)}
                onRemoveAttachment={remove}
                canAttach={canAttach}
                canSubmit={canSubmit}
            />
        </>
    );
};
