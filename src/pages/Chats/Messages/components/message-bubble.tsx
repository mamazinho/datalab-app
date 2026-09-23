import ReactMarkdown from 'react-markdown';
import type { IChatFileRef } from '../../../../services/datalab-api/chatFilesResource';
import { AttachmentChip } from './attachment-chip';
import { AttachmentsInBubble, Bubble, MainContent, MessageRow, StreamingCursor } from '../messages.style';

interface MessageBubbleProps {
    content: string;
    isUser: boolean;
    isStreaming?: boolean;
    attachments?: IChatFileRef[];
}

export const MessageBubble = ({ content, isUser, isStreaming = false, attachments = [] }: MessageBubbleProps) => (
    <MessageRow $isUser={isUser}>
        <Bubble $isUser={isUser}>
            <MainContent>
                <ReactMarkdown>{content}</ReactMarkdown>
                {isStreaming && <StreamingCursor aria-hidden>▍</StreamingCursor>}
            </MainContent>
            {attachments.length > 0 && (
                <AttachmentsInBubble>
                    {attachments.map((file) => (
                        <AttachmentChip key={file.id} filename={file.filename} size={file.size} />
                    ))}
                </AttachmentsInBubble>
            )}
        </Bubble>
    </MessageRow>
);
