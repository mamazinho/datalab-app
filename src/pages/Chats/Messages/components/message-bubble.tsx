import type { IMessage } from "../../../../utils/process-stream";

interface MessageBubbleProps {
    message: IMessage;
}

export const MessageBubble = ({ message }: MessageBubbleProps) => {
    const isUser = message.role === 'user';
    
    return (
        <div className={`flex w-full mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] px-4 py-3 shadow-sm ${
                isUser 
                ? 'bg-blue-600 text-white rounded-2xl rounded-br-none' 
                : 'bg-white border border-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100 rounded-2xl rounded-bl-none'
            }`}>
                <div className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</div>
                <div className={`text-[10px] mt-1 opacity-70 font-medium ${isUser ? 'text-blue-100 text-right' : 'text-gray-400 text-left'}`}>
                    {new Date(message.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </div>
            </div>
        </div>
    );
};