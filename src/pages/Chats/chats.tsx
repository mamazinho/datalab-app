import { useEffect } from 'react';
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
import { useChatsContext } from '../../contexts/chats';

export const Chats = () => {
  const { chats, getAllChats } = useChatsContext();

  useEffect(() => {
    void getAllChats();
  }, [getAllChats]);

  return (
    <ChatContainer>
      <ChatPageContent>
      <ChatHeaderCard>
        <div>
          <ChatHeaderTitle>Gerenciador de conversas</ChatHeaderTitle>
          <ChatHeaderText>Inicie novas conversas ou continue de onde parou</ChatHeaderText>
        </div>
        <CreateChat onCreateChat={getAllChats} />
      </ChatHeaderCard>
        
      <ChatListCard>
        <div>
          <ChatListTitle>
            <ChatListTitleBadge>📋</ChatListTitleBadge>
            Conversas Disponíveis
          </ChatListTitle>
          <ChatList chats={chats} />
        </div>
      </ChatListCard>
      </ChatPageContent>
    </ChatContainer>
  );
};
