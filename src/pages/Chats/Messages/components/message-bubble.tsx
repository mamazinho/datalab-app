import type { ReactNode } from 'react';
import ReactMarkdown from 'react-markdown';
import { Bubble, MainContent, MessageRow, StreamingCursor } from '../messages.style';

interface MessageBubbleProps {
    content: string;
    isUser: boolean;
    isStreaming?: boolean;
    children?: ReactNode;
}

export const MessageBubble = ({ content, isUser, isStreaming = false, children }: MessageBubbleProps) => (
    <MessageRow $isUser={isUser}>
        <Bubble $isUser={isUser}>
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
