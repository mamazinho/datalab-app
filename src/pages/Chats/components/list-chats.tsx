import type { IRetrieveChat } from '../../../services/datalab-api/chatsResource';
import { ChatItemCard, ChatItemLink, ChatListWrapper, ChatTitle, EmptyChatList } from './chats-components.style';


export const ChatList = ({ chats }: { chats: IRetrieveChat[] }) => {
    if (!chats.length) return <EmptyChatList>Nenhum chat encontrado.</EmptyChatList>;

    return (
        <ChatListWrapper>
            {chats.map(chat => (
                <div key={chat.id}>
                    <ChatItemLink to={`/chats/${chat.id}/messages`}>
                        <ChatItemCard>
                            <ChatTitle>{chat.title}</ChatTitle>
                        </ChatItemCard>
                    </ChatItemLink>
                </div>
            ))}
        </ChatListWrapper>
    );
};
