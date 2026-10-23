import { useState } from 'react';
import { toast } from 'react-toastify';
import { useQueryClient } from '@tanstack/react-query';
import { ChatMember } from '../../../components/UI/ChatMember';
import { useCompanyContext, useCompanyPermissions } from '../../../contexts/company';
import { chatListsQueryKey } from '../../../queries';
import { DatalabAPI } from '../../../services/datalab-api';
import type { IRetrieveChat } from '../../../services/datalab-api/chatsResource';
import { Badge } from '../../../styles/design-system.style';
import type { UUID7 } from '../../../types/ids';
import { CHAT_ROUTE_PERMISSIONS } from '../../../utils/route-permissions';
import {
    ChatItemActionButton,
    ChatItemActions,
    ChatItemCard,
    ChatItemDetails,
    ChatItemLink,
    ChatListWrapper,
    ChatTitle,
    EmptyChatList,
} from './chats-components.style';

export const ChatList = ({ chats }: { chats: IRetrieveChat[] }) => {
    const { currentMembership, hasPermissionByRoute } = useCompanyContext();
    const { isOwner } = useCompanyPermissions();
    const queryClient = useQueryClient();
    const [busyChatId, setBusyChatId] = useState<UUID7 | null>(null);

    const canArchive = hasPermissionByRoute(CHAT_ROUTE_PERMISSIONS.update);
    const canRemove = hasPermissionByRoute(CHAT_ROUTE_PERMISSIONS.remove);

    const runChatAction = async (chat: IRetrieveChat, action: () => Promise<unknown>, successMessage: string) => {
        setBusyChatId(chat.id);
        try {
            await action();
            toast.success(successMessage);
            void queryClient.invalidateQueries({ queryKey: chatListsQueryKey });
        } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : 'Erro ao atualizar a conversa.');
        } finally {
            setBusyChatId(null);
        }
    };

    const toggleArchived = (chat: IRetrieveChat) =>
        runChatAction(
            chat,
            () => DatalabAPI.ChatsResource.archiveChat(chat.id, !chat.archived),
            chat.archived ? 'Conversa desarquivada.' : 'Conversa arquivada.',
        );

    const deleteChat = (chat: IRetrieveChat) => {
        if (!window.confirm('Excluir esta conversa? Essa ação não pode ser desfeita.')) return;
        void runChatAction(chat, () => DatalabAPI.ChatsResource.deleteChat(chat.id), 'Conversa excluída.');
    };

    if (!chats.length) return <EmptyChatList>Nenhum chat encontrado.</EmptyChatList>;

    return (
        <ChatListWrapper>
            {chats.map(chat => {
                const isCreatorOrOwner = isOwner || chat.created_by_membership_id === currentMembership?.id;
                const canArchiveChat = canArchive && isCreatorOrOwner;
                const canDeleteChat = canRemove && isCreatorOrOwner;
                const isBusy = busyChatId === chat.id;

                return (
                    <ChatItemCard key={chat.id}>
                        <ChatItemLink to={`/ia/conversas/${chat.id}/mensagens`}>
                            <ChatTitle>{chat.title ?? 'Sem título'}</ChatTitle>
                            <ChatItemDetails>
                                {chat.created_by && <ChatMember member={chat.created_by} />}
                                {chat.is_private && <Badge>Privada</Badge>}
                                {chat.archived && <Badge>Arquivada</Badge>}
                            </ChatItemDetails>
                        </ChatItemLink>

                        {(canArchiveChat || canDeleteChat) && (
                            <ChatItemActions>
                                {canArchiveChat && (
                                    <ChatItemActionButton disabled={isBusy} onClick={() => void toggleArchived(chat)}>
                                        {chat.archived ? 'Desarquivar' : 'Arquivar'}
                                    </ChatItemActionButton>
                                )}
                                {canDeleteChat && (
                                    <ChatItemActionButton disabled={isBusy} onClick={() => deleteChat(chat)}>
                                        Excluir
                                    </ChatItemActionButton>
                                )}
                            </ChatItemActions>
                        )}
                    </ChatItemCard>
                );
            })}
        </ChatListWrapper>
    );
};
