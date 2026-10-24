import type { ReactNode } from 'react';
import type { IChatMember } from '../../../../services/datalab-api/chatsResource';
import { AuthorAvatar, AuthorName, AuthorSpacer, MessageColumn, MessageRow } from '../messages.style';

interface IAuthoredRowProps {
    author: IChatMember | null;
    showAuthor: boolean;
    isUser: boolean;
    children: ReactNode;
}

export const AuthoredRow = ({ author, showAuthor, isUser, children }: IAuthoredRowProps) => {
    const visibleAuthor = showAuthor ? author : null;

    return (
        <MessageRow $isUser={isUser} $continued={!showAuthor}>
            {visibleAuthor ? <AuthorAvatar src={visibleAuthor.avatar_url} name={visibleAuthor.name} alt="" /> : <AuthorSpacer />}
            <MessageColumn $isUser={isUser}>
                {visibleAuthor && <AuthorName>{visibleAuthor.name}</AuthorName>}
                {children}
            </MessageColumn>
        </MessageRow>
    );
};
