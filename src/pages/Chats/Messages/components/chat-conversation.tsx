import { useState } from 'react';
import type { IChatMessageRead } from '../../../../services/datalab-api/chatMessagesResource';
import { useChatStream } from '../use-chat-stream';
import { MessageList } from './message-list';
import { MessageInput } from './message-input';

interface ChatConversationProps {
    chatId: number;
    history: IChatMessageRead[];
}

export const ChatConversation = ({ chatId, history }: ChatConversationProps) => {
    const { items, isStreaming, pendingClarification, sendPrompt, answerClarification } =
        useChatStream(chatId, history);
    const [prompt, setPrompt] = useState('');

    const handleSubmit = () => {
        if (!prompt.trim() || isStreaming) return;

        const currentPrompt = prompt;
        setPrompt('');
        void sendPrompt(currentPrompt);
    };

    return (
        <>
            <MessageList
                items={items}
                isStreaming={isStreaming}
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
            />
        </>
    );
};
