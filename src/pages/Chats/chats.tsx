import { useState, useCallback } from 'react';
import { AsyncResource } from '../../components/Tools/async-resource';
import { DatalabAPI } from '../../services/datalab-api';
import { type IRetrieveChat } from '../../services/datalab-api/chatsResource';
import { ChatContainer } from './chats.style';
import { CreateChat } from './components/create-chat';
import { ChatList } from './components/list-chats';

export const Chats = () => {
  const [newChats, setNewChats] = useState<IRetrieveChat[]>([]);

  const handleNewChat = useCallback((chat: IRetrieveChat) => {
    setNewChats((prevChats) => [chat, ...prevChats]);
  }, []);

  return (
    <ChatContainer>
      <div className="max-w-5xl mx-auto px-4 py-8 w-full">
        <div className="flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8 transition-all hover:shadow-md">
            <div className="text-center md:text-left mb-4 md:mb-0">
                <h1 className="text-2xl font-bold text-gray-800">Gerenciador de Chats</h1>
                <p className="text-gray-500 text-sm">Inicie novas conversas ou continue de onde parou</p>
            </div>
            {/* <CreateChat onCreateChat={(chat) => setNewChats([chat, ...newChats])} /> */}
            <CreateChat onCreateChat={handleNewChat} />
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 transition-all hover:shadow-md">
            <div className="w-full">
                <h3 className="text-xl font-bold text-gray-700 mb-6 flex items-center gap-2">
                    <span className="p-2 bg-orange-100 rounded-lg text-orange-600 text-sm">📋</span>
                    Chats Disponíveis
                </h3>
                <AsyncResource fetcher={DatalabAPI.ChatsResource.getAllChats}>
                    {(data) => <ChatList chats={[...newChats, ...data]} />}
                </AsyncResource>
            </div>
        </div>
      </div>
    </ChatContainer>
  );
};
