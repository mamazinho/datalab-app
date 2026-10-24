import type { ReactNode } from 'react';
import ReactMarkdown from 'react-markdown';
import type { IChatMember } from '../../../../services/datalab-api/chatsResource';
import { Bubble, MainContent, MessageTime, StreamingCursor } from '../messages.style';
import { AuthoredRow } from './authored-row';

interface MessageBubbleProps {
    content: string;
    isUser: boolean;
    author: IChatMember | null;
    showAuthor: boolean;
    createdAt: string;
    isStreaming?: boolean;
    children?: ReactNode;
}

const timeFormat = new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' });

export const MessageBubble = ({ content, isUser, author, showAuthor, createdAt, isStreaming = false, children }: MessageBubbleProps) => (
    <AuthoredRow author={author} showAuthor={showAuthor} isUser={isUser}>
        <Bubble $isUser={isUser}>
            {(content || isStreaming) && (
                <MainContent>
                    <ReactMarkdown>{content}</ReactMarkdown>
                    {isStreaming && <StreamingCursor aria-hidden>▍</StreamingCursor>}
                </MainContent>
            )}
            {children}
            <MessageTime $isUser={isUser} dateTime={createdAt}>
                {timeFormat.format(new Date(createdAt))}
            </MessageTime>
        </Bubble>
    </AuthoredRow>
);
