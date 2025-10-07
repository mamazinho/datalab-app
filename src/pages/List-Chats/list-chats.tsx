import { ChatContainer } from './list-chats.style';
import { AllChats } from '../../components/Chats/list-chats';
import { CreateChat } from '../../components/Chats/create-chat';

export const ListChats = () => {
  return (
    <ChatContainer>
      <CreateChat />
      <AllChats />
    </ChatContainer>
  );
};
