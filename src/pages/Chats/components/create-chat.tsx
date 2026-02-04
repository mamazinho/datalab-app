import { useState } from 'react';
import { DatalabAPI } from '../../../services/datalab-api';
import { type ICreateChat, type IRetrieveChat } from '../../../services/datalab-api/chatsResource';

interface ICreateChatProps {
    onCreateChat: (chat: IRetrieveChat) => void;
}

export const CreateChat = ({ onCreateChat }: ICreateChatProps) => {
    const [toCreateChat, setToCreateChat] = useState(false);
    const [chatPayload, setChatPayload] = useState<ICreateChat>();

    const handleSubmit = async () => {
        if (!chatPayload) throw new Error("Payload is required");
        try {
            const data = await DatalabAPI.ChatsResource.createChat(chatPayload);
            onCreateChat(data);
            setToCreateChat(false);
            setChatPayload(undefined);
        } catch (error) {
            console.error("Error creating chat:", error);
        }
    };

    return (
        <div className="relative inline-block">
            <button
                className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors shadow-sm font-medium cursor-pointer flex items-center gap-2"
                onClick={() => setToCreateChat(!toCreateChat)}
            >
                Criar novo chat
            </button>
            {toCreateChat && (
                <div className="absolute top-full left-0 mt-2 p-4 bg-white border border-gray-200 rounded-xl shadow-xl flex flex-col gap-3 min-w-70 z-50">
                    <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 bg-gray-50 focus:bg-white transition-all"
                        value={chatPayload?.title}
                        onChange={e => setChatPayload({ title: e.target.value })}
                        placeholder="Chat Title"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                handleSubmit();
                            }
                        }}
                    />
                    <button
                        type="submit"
                        className="w-full bg-orange-600 text-white px-3 py-2 rounded-lg hover:bg-orange-700 transition-colors font-medium cursor-pointer shadow-sm"
                        onClick={handleSubmit}
                    >
                        Create
                    </button>
                </div>
            )}
        </div>
    );
}