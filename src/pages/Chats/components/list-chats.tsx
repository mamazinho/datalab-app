import styles from './chats-components.module.css';
import designSystemStyles from '../../../styles/design-system.module.css';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { useQueryClient } from '@tanstack/react-query';
import { ChatMember } from '../../../components/UI/ChatMember';
import { useCompanyContext, useCompanyPermissions } from '../../../contexts/company';
import { chatListsQueryKey } from '../../../queries';
import { DatalabAPI } from '../../../services/datalab-api';
import type { IRetrieveChat } from '../../../services/datalab-api/chatsResource';
import type { UUID7 } from '../../../types/ids';
import { CHAT_ROUTE_PERMISSIONS } from '../../../utils/route-permissions';

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

    if (!chats.length) return <div className={styles.emptyChatList}>Nenhum chat encontrado.</div>;

    return (
        <ul className={styles.chatListWrapper}>
            {chats.map(chat => {
                const isCreatorOrOwner = isOwner || chat.created_by_membership_id === currentMembership?.id;
                const canArchiveChat = canArchive && isCreatorOrOwner;
                const canDeleteChat = canRemove && isCreatorOrOwner;
                const isBusy = busyChatId === chat.id;

                return (
                    <li className={styles.chatItemCard} key={chat.id}>
                        <Link className={styles.chatItemLink} to={`/ia/conversas/${chat.id}/mensagens`}>
                            <h5 className={styles.chatTitle}>{chat.title ?? 'Sem título'}</h5>
                            <div className={styles.chatItemDetails}>
                                {chat.created_by && <ChatMember member={chat.created_by} />}
                                {chat.is_private && <span className={designSystemStyles.badge}>Privada</span>}
                                {chat.archived && <span className={designSystemStyles.badge}>Arquivada</span>}
                            </div>
                        </Link>

                        {(canArchiveChat || canDeleteChat) && (
                            <div className={styles.chatItemActions}>
                                {canArchiveChat && (
                                    <button className={styles.chatItemActionButton} disabled={isBusy} onClick={() => void toggleArchived(chat)}>
                                        {chat.archived ? 'Desarquivar' : 'Arquivar'}
                                    </button>
                                )}
                                {canDeleteChat && (
                                    <button className={styles.chatItemActionButton} disabled={isBusy} onClick={() => deleteChat(chat)}>
                                        Excluir
                                    </button>
                                )}
                            </div>
                        )}
                    </li>
                );
            })}
        </ul>
    );
};
