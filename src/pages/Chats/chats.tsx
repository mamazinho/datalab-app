import { useState } from 'react';
import {
  ChatContainer,
  ChatHeaderCard,
  ChatHeaderText,
  ChatHeaderTitle,
  ChatListCard,
  ChatListHeader,
  ChatListTitle,
  ChatListTitleBadge,
  ChatPageContent,
} from './chats.style';
import { CreateChat } from './components/create-chat';
import { ChatList } from './components/list-chats';
import { QueryBoundary } from '../../components/Tools/query-boundary';
import { Toggle } from '../../components/UI/Inputs/Toggle';
import { useChats } from '../../hooks/use-chats';

const ChatsListSection = ({ includeArchived }: { includeArchived: boolean }) => {
  const { data: chats } = useChats(includeArchived);

  return <ChatList chats={chats} />;
};

export const Chats = () => {
  const [includeArchived, setIncludeArchived] = useState(false);

  return (
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
          <ChatListHeader>
            <ChatListTitle>
              <ChatListTitleBadge>📋</ChatListTitleBadge>
              Conversas Disponíveis
            </ChatListTitle>
            <Toggle
              label="Mostrar arquivadas"
              checked={includeArchived}
              onChange={(event) => setIncludeArchived(event.target.checked)}
            />
          </ChatListHeader>
          <QueryBoundary>
            <ChatsListSection includeArchived={includeArchived} />
          </QueryBoundary>
        </ChatListCard>
      </ChatPageContent>
    </ChatContainer>
  );
};
