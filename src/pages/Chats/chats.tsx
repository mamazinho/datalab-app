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
import { QueryBoundary } from '../../components/Tools/query-boundary';
import { useChats } from '../../hooks/use-chats';

const ChatsListSection = () => {
  const { data: chats } = useChats();

  return <ChatList chats={chats} />;
};

export const Chats = () => (
  <ChatContainer>
    <ChatPageContent>
      <ChatHeaderCard>
        <div>
          <ChatHeaderTitle>Gerenciador de conversas</ChatHeaderTitle>
          <ChatHeaderText>Inicie novas conversas ou continue de onde parou</ChatHeaderText>
        </div>
        <CreateChat />
      </ChatHeaderCard>

      <ChatListCard>
        <div>
          <ChatListTitle>
            <ChatListTitleBadge>📋</ChatListTitleBadge>
            Conversas Disponíveis
          </ChatListTitle>
          <QueryBoundary>
            <ChatsListSection />
          </QueryBoundary>
        </div>
      </ChatListCard>
    </ChatPageContent>
  </ChatContainer>
);
