import ReactMarkdown from 'react-markdown';
import { Bubble, MainContent, MessageRow, StreamingCursor } from '../messages.style';

interface MessageBubbleProps {
    content: string;
    isUser: boolean;
    isStreaming?: boolean;
}

export const MessageBubble = ({ content, isUser, isStreaming = false }: MessageBubbleProps) => (
    <MessageRow $isUser={isUser}>
        <Bubble $isUser={isUser}>
            <MainContent>
                <ReactMarkdown>{content}</ReactMarkdown>
                {isStreaming && <StreamingCursor aria-hidden>▍</StreamingCursor>}
            </MainContent>
        </Bubble>
    </MessageRow>
);
