import type { IMessage } from "../../../../utils/process-stream";
import ReactMarkdown from 'react-markdown'
import { Bubble, InternalContent, InternalDetails, InternalItem, InternalList, InternalMeta, InternalSummary, MainContent, MessageRow, MessageTime } from '../messages.style';

interface MessageBubbleProps {
    message: IMessage;
    internalMessages?: IMessage[];
}

export const MessageBubble = ({ message, internalMessages = [] }: MessageBubbleProps) => {
    const isUser = message.sender === 'user';
    const hasInternalMessages = internalMessages.length > 0;
    const hasMainContent = message.content.trim().length > 0;

    const formatActorName = (internalMessage: IMessage, actor: string) => {
        if (actor === 'user') return 'Usuário';
        if (actor === 'agent') return 'Agente';
        if (actor === 'supervisor') return 'Supervisor';
        if (actor === "specialist") {
            if (internalMessage.specialist_key) return `${internalMessage.specialist_key} (${actor})`;
        }
        return actor;
    }

    return (
        <MessageRow $isUser={isUser}>
            <Bubble $isUser={isUser}>
                {hasInternalMessages && (
                    <InternalDetails>
                        <InternalSummary>
                            Conversa interna do agente ({internalMessages.length})
                        </InternalSummary>
                        <InternalList>
                            {internalMessages.map((internalMessage, index) => (
                                <InternalItem key={`${internalMessage.timestamp}-${index}`}>
                                    <InternalMeta>
                                        {formatActorName(
                                            internalMessage, internalMessage.sender
                                        )} → {formatActorName(internalMessage, internalMessage.receiver)}
                                    </InternalMeta>
                                    <InternalContent>
                                        <ReactMarkdown>{internalMessage.content}</ReactMarkdown>
                                    </InternalContent>
                                </InternalItem>
                            ))}
                        </InternalList>
                    </InternalDetails>
                )}
                {hasMainContent && (
                    <MainContent>
                        <ReactMarkdown>{message.content}</ReactMarkdown>
                    </MainContent>
                )}
                <MessageTime $isUser={isUser}>
                    {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </MessageTime>
            </Bubble>
        </MessageRow>
    );
};