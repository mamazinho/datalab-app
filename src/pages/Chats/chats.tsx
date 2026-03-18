import { useState, useCallback } from 'react';
import { AsyncResource } from '../../components/Tools/async-resource';
import { DatalabAPI } from '../../services/datalab-api';
import { type IRetrieveChat } from '../../services/datalab-api/chatsResource';
import {
  ChatContainer,
  ChatHeaderCard,
  ChatHeaderText,
  ChatHeaderTitle,
  ChatListCard,
  ChatListTitle,
  ChatListTitleBadge,
  ChatPageContent,
} from './chats.style';
import { CreateChat } from './components/create-chat';
import { ChatList } from './components/list-chats';

export const Chats = () => {
  const [newChats, setNewChats] = useState<IRetrieveChat[]>([]);

  const handleNewChat = useCallback((chat: IRetrieveChat) => {
    setNewChats((prevChats) => [chat, ...prevChats]);
  }, []);

  return (
    <ChatContainer>
      <ChatPageContent>
      <ChatHeaderCard>
        <div>
          <ChatHeaderTitle>Gerenciador de Chats</ChatHeaderTitle>
          <ChatHeaderText>Inicie novas conversas ou continue de onde parou</ChatHeaderText>
            </div>
            {/* <CreateChat onCreateChat={(chat) => setNewChats([chat, ...newChats])} /> */}
            <CreateChat onCreateChat={handleNewChat} />
      </ChatHeaderCard>
        
      <ChatListCard>
        <div>
          <ChatListTitle>
            <ChatListTitleBadge>📋</ChatListTitleBadge>
                    Chats Disponíveis
          </ChatListTitle>
                <AsyncResource fetcher={DatalabAPI.ChatsResource.getAllChats}>
                    {(data) => <ChatList chats={[...newChats, ...data]} />}
                </AsyncResource>
            </div>
      </ChatListCard>
      </ChatPageContent>
    </ChatContainer>
  );
};
