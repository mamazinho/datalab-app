import styles from '../messages.module.css';
import type { ReactNode } from 'react';
import ReactMarkdown from 'react-markdown';
import type { IChatMember } from '../../../../services/datalab-api/chatsResource';
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
        <div className={styles.bubble}>
            {(content || isStreaming) && (
                <div className={styles.mainContent}>
                    <ReactMarkdown>{content}</ReactMarkdown>
                    {isStreaming && <span className={styles.streamingCursor} aria-hidden>▍</span>}
                </div>
            )}
            {children}
            <time className={styles.messageTime} dateTime={createdAt}>
                {timeFormat.format(new Date(createdAt))}
            </time>
        </div>
    </AuthoredRow>
);
