import type { IMessage } from "../../../../utils/process-stream";
import ReactMarkdown from 'react-markdown'

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
        <div className={`flex w-full mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] px-4 py-3 shadow-sm ${isUser
                    ? 'bg-zinc-800 text-zinc-100 rounded-2xl rounded-br-none border border-zinc-700/80'
                    : 'bg-linear-to-br from-orange-500 via-orange-400 to-amber-300 text-zinc-900 rounded-2xl rounded-bl-none border border-amber-400/70'
                }`}>
                {hasInternalMessages && (
                    <details className="mb-3 border border-zinc-300/70 rounded-lg bg-white/65 backdrop-blur-sm">
                        <summary className="cursor-pointer px-3 py-2 text-xs font-semibold text-zinc-700">
                            Conversa interna do agente ({internalMessages.length})
                        </summary>
                        <div className="px-3 pb-3 space-y-2">
                            {internalMessages.map((internalMessage, index) => (
                                <div key={`${internalMessage.timestamp}-${index}`} className="rounded-md border border-zinc-200 bg-white/90 p-2">
                                    <div className="text-[10px] font-semibold text-zinc-500 mb-1">
                                        {formatActorName(
                                            internalMessage, internalMessage.sender
                                        )} → {formatActorName(internalMessage, internalMessage.receiver)}
                                    </div>
                                    <div className="text-xs leading-snug text-zinc-700 whitespace-pre-wrap [&_p]:my-0 [&_ul]:my-1 [&_ol]:my-1 [&_li]:my-0">
                                        <ReactMarkdown>{internalMessage.content}</ReactMarkdown>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </details>
                )}
                {hasMainContent && (
                    <div className="text-sm leading-snug whitespace-pre-wrap [&_p]:my-0 [&_ul]:my-1 [&_ol]:my-1 [&_li]:my-0">
                        <ReactMarkdown>{message.content}</ReactMarkdown>
                    </div>
                )}
                <div className={`text-[10px] mt-2 opacity-75 font-medium ${isUser ? 'text-zinc-300 text-right' : 'text-zinc-700 text-left'}`}>
                    {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
            </div>
        </div>
    );
};