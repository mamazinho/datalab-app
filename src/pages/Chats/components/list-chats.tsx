import styles from './chats-components.module.css';
import designSystemStyles from '../../../styles/design-system.module.css';
import { Link } from 'react-router-dom';
import { ChatMember } from '../../../components/UI/ChatMember';
import { useCompanyContext } from '../../../contexts/company';
import { useConfirm } from '../../../contexts/confirm';
import { chatListsQueryKey } from '../../../queries';
import { DatalabAPI } from '../../../services/datalab-api';
import type { IRetrieveChat } from '../../../services/datalab-api/chatsResource';
import { CHAT_ROUTE_PERMISSIONS } from '../../../utils/route-permissions';
import { useRowActions } from '../../../hooks/use-row-actions';

export const ChatList = ({ chats }: { chats: IRetrieveChat[] }) => {
    const { currentMembership, isOwner, hasPermissionByRoute } = useCompanyContext();
    const confirm = useConfirm();
    const { rows, isBusy, run } = useRowActions(chatListsQueryKey, chats);

    const canArchive = hasPermissionByRoute(CHAT_ROUTE_PERMISSIONS.update);
    const canRemove = hasPermissionByRoute(CHAT_ROUTE_PERMISSIONS.remove);

    const toggleArchived = (chat: IRetrieveChat) =>
        run({
            id: chat.id,
            request: () => DatalabAPI.ChatsResource.archiveChat(chat.id, !chat.archived),
            successMessage: chat.archived ? 'Conversa desarquivada.' : 'Conversa arquivada.',
            optimistic: { ...chat, archived: !chat.archived },
        });

    const deleteChat = async (chat: IRetrieveChat) => {
        const confirmed = await confirm({
            title: 'Excluir conversa',
            message: 'Essa ação não pode ser desfeita.',
            confirmLabel: 'Excluir',
        });
        if (confirmed) {
            run({ id: chat.id, request: () => DatalabAPI.ChatsResource.deleteChat(chat.id), successMessage: 'Conversa excluída.', optimistic: null });
        }
    };

    if (!rows.length) return <div className={styles.emptyChatList}>Nenhum chat encontrado.</div>;

    return (
        <ul className={styles.chatListWrapper}>
            {rows.map(chat => {
                const isCreatorOrOwner = isOwner || chat.created_by_membership_id === currentMembership?.id;
                const canArchiveChat = canArchive && isCreatorOrOwner;
                const canDeleteChat = canRemove && isCreatorOrOwner;
                const rowBusy = isBusy(chat.id);

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
                                    <button className={styles.chatItemActionButton} disabled={rowBusy} onClick={() => toggleArchived(chat)}>
                                        {chat.archived ? 'Desarquivar' : 'Arquivar'}
                                    </button>
                                )}
                                {canDeleteChat && (
                                    <button className={styles.chatItemActionButton} disabled={rowBusy} onClick={() => void deleteChat(chat)}>
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
