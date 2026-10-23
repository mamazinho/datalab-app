import type { ReactNode } from 'react';
import ReactMarkdown from 'react-markdown';
import { Bubble, BubbleSender, MainContent, MessageRow, StreamingCursor } from '../messages.style';

interface MessageBubbleProps {
    content: string;
    isUser: boolean;
    isStreaming?: boolean;
    sender?: ReactNode;
    children?: ReactNode;
}

export const MessageBubble = ({ content, isUser, isStreaming = false, sender, children }: MessageBubbleProps) => (
    <MessageRow $isUser={isUser}>
        <Bubble $isUser={isUser}>
            {sender && <BubbleSender>{sender}</BubbleSender>}
            {(content || isStreaming) && (
                <MainContent>
                    <ReactMarkdown>{content}</ReactMarkdown>
                    {isStreaming && <StreamingCursor aria-hidden>▍</StreamingCursor>}
                </MainContent>
            )}
            {children}
        </Bubble>
    </MessageRow>
);
