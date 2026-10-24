import styles from '../messages.module.css';
import { Avatar } from '../../../../components/UI/Avatar';
import type { ReactNode } from 'react';
import type { IChatMember } from '../../../../services/datalab-api/chatsResource';

interface IAuthoredRowProps {
    author: IChatMember | null;
    showAuthor: boolean;
    isUser: boolean;
    children: ReactNode;
}

export const AuthoredRow = ({ author, showAuthor, isUser, children }: IAuthoredRowProps) => {
    const visibleAuthor = showAuthor ? author : null;

    return (
        <div className={styles.messageRow} data-user={isUser} data-continued={!showAuthor}>
            {visibleAuthor ? <Avatar className={styles.authorAvatar} src={visibleAuthor.avatar_url} name={visibleAuthor.name} alt="" /> : <span className={styles.authorSpacer} />}
            <div className={styles.messageColumn}>
                {visibleAuthor && <span className={styles.authorName}>{visibleAuthor.name}</span>}
                {children}
            </div>
        </div>
    );
};
