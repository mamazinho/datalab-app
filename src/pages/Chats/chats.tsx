import styles from './chats.module.css';
import { useState } from 'react';
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
    <div className={styles.chatContainer}>
      <div className={styles.chatPageContent}>
        <section className={styles.chatHeaderCard}>
          <div>
            <h1 className={styles.chatHeaderTitle}>Gerenciador de conversas</h1>
            <p className={styles.chatHeaderText}>Inicie novas conversas ou continue de onde parou</p>
          </div>
          <CreateChat />
        </section>

        <section className={styles.chatListCard}>
          <div className={styles.chatListHeader}>
            <h3 className={styles.chatListTitle}>
              <span className={styles.chatListTitleBadge}>📋</span>
              Conversas Disponíveis
            </h3>
            <Toggle
              label="Mostrar arquivadas"
              checked={includeArchived}
              onChange={(event) => setIncludeArchived(event.target.checked)}
            />
          </div>
          <QueryBoundary>
            <ChatsListSection includeArchived={includeArchived} />
          </QueryBoundary>
        </section>
      </div>
    </div>
  );
};
