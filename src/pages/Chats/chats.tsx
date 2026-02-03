import { ChatContainer } from './chats.style';
import { CreateChat } from './components/create-chat';
import { AllChats } from './components/list-chats';

export const Chats = () => {
  return (
    <ChatContainer>
      <CreateChat />
      <AllChats />
    </ChatContainer>
  );
};
