import React, { useCallback, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { MessageList } from './components/message-list';
import { MessageInput } from './components/message-input';
import { AsyncResource } from '../../../components/Tools/async-resource';
import { DatalabAPI } from '../../../services/datalab-api';
import { processStreamResponse, type IMessage } from '../../../utils/process-stream';

export const ChatMessages: React.FC = () => {
    const { chatId } = useParams<{ chatId: string }>();
    const mapMessagesByRole = useRef(new Map<string, IMessage>());

    const [error, setError] = useState<string | null>(null);
    const [appendedMessages, setAppendedMessages] = useState<IMessage[]>([]);
    const [streamingMessages, setStreamingMessages] = useState<IMessage[]>([]);
    const [isDisabled, setIsDisabled] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [prompt, setPrompt] = useState('');

    const handleError = useCallback((error: unknown) => {
        console.error(error);
        setError('Error occurred, check the browser developer console for more information.');
        setIsDisabled(false);
        setIsLoading(false);
    }, []);

    const streamingMessage = useCallback(async (newMessages: IMessage[]) => {
        if (!newMessages.length) return;

        const lastMessage = newMessages[newMessages.length - 1];
        if (lastMessage?.role) {
            mapMessagesByRole.current.set(lastMessage.role, lastMessage);
        }

        setStreamingMessages(Array.from(mapMessagesByRole.current.values()));
    }, []);

    const streamingCompleted = useCallback(async () => {
        setStreamingMessages((streamedMessages) => {
            setAppendedMessages([...streamedMessages]);
            return [];
        });
        mapMessagesByRole.current.clear();
    }, []);

    const fetchMessages = useCallback(async (): Promise<IMessage[]> => {
        if (!chatId) return [];

        const stream = await DatalabAPI.ChatMessagesResource.getChatMessages(Number(chatId));
        let finalMessages: IMessage[] = [];

        await processStreamResponse(stream, (newMessages) => {
            finalMessages = [...newMessages];
        });

        return finalMessages;
    }, [chatId]);

    const handleSendMessage = async () => {
        if (!prompt.trim() || !chatId) return;
        setIsLoading(true);
        setIsDisabled(true);
        setError(null);

        const currentPrompt = prompt;
        setPrompt('');

        try {
            const stream = await DatalabAPI.ChatMessagesResource.sendMessage(Number(chatId), currentPrompt);
            await processStreamResponse(stream, streamingMessage, streamingCompleted);
        } catch (error) {
            handleError(error);
        } finally {
            setIsLoading(false);
            setIsDisabled(false);
        }
    };

    return (
        <div className="flex flex-col h-full w-full max-w-5xl mx-auto p-4 md:p-6 bg-white rounded-2xl shadow-sm border border-gray-100 my-4 message-container">
            <div className="mb-6 pb-4 border-b border-gray-100 text-center sm:text-left">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Chat <span className="text-orange-600">#{chatId}</span></h2>
                <p className="text-gray-500 text-sm md:text-base">Converse com nossa IA e tire suas dúvidas</p>
            </div>

            <div className="flex-1 min-h-0 overflow-hidden relative flex flex-col">
                <AsyncResource fetcher={fetchMessages} dependencies={[chatId]}>
                    {(initialMessages) => (
                        <MessageList
                            messages={[...initialMessages, ...appendedMessages]}
                            streamingMessages={streamingMessages}
                        />
                    )}
                </AsyncResource>
            </div>

            {error && (
                <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-xl border border-red-200 flex items-center gap-2 animate-pulse mb-4">
                    <span className="font-bold">Error:</span> {error}
                </div>
            )}

            <MessageInput
                value={prompt}
                onChange={setPrompt}
                onSubmit={handleSendMessage}
                isLoading={isLoading}
                isDisabled={isDisabled}
            />
        </div>
    );
};

