import type { IMessage } from "../../../../utils/process-stream";
import ReactMarkdown from 'react-markdown'

interface MessageBubbleProps {
    message: IMessage;
    internalMessages?: IMessage[];
}

export const MessageBubble = ({ message, internalMessages = [] }: MessageBubbleProps) => {
    const isUser = message.role === 'user';
    const hasInternalMessages = internalMessages.length > 0;
    const hasMainContent = message.content.trim().length > 0;
    
    return (
        <div className={`flex w-full mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] px-4 py-3 shadow-sm ${
                isUser 
                ? 'bg-blue-600 text-white rounded-2xl rounded-br-none' 
                : 'bg-white border border-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100 rounded-2xl rounded-bl-none'
            }`}>
                {hasInternalMessages && (
                    <details className="mt-3 border border-gray-200 rounded-lg bg-gray-50">
                        <summary className="cursor-pointer px-3 py-2 text-xs font-semibold text-gray-600">
                            Conversa interna do agente ({internalMessages.length})
                        </summary>
                        <div className="px-3 pb-3 space-y-2">
                            {internalMessages.map((internalMessage, index) => (
                                <div key={`${internalMessage.timestamp}-${index}`} className="rounded-md border border-gray-200 bg-white p-2">
                                    <div className="text-[10px] font-semibold text-gray-500 mb-1">
                                        {internalMessage.role} → {internalMessage.actor_role}
                                    </div>
                                    <div className="text-xs leading-relaxed text-gray-700 whitespace-pre-wrap">
                                        <ReactMarkdown>{internalMessage.content}</ReactMarkdown>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </details>
                )}
                {hasMainContent && (
                    <div className="text-sm leading-relaxed whitespace-pre-wrap mt-3">
                        <ReactMarkdown>{message.content}</ReactMarkdown>
                    </div>
                )}
                <div className={`text-[10px] mt-1 opacity-70 font-medium ${isUser ? 'text-blue-100 text-right' : 'text-gray-400 text-left'}`}>
                    {new Date(message.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </div>
            </div>
        </div>
    );
};