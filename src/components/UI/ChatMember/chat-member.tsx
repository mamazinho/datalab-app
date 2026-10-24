import styles from './chat-member.module.css';
import { Avatar } from '../Avatar';
import type { IChatMember } from '../../../services/datalab-api/chatsResource';

export const ChatMember = ({ member }: { member: IChatMember }) => (
  <span className={styles.chatMemberWrapper}>
    <Avatar className={styles.chatMemberAvatar} src={member.avatar_url} name={member.name} alt="" />
    <span className={styles.chatMemberName}>{member.name}</span>
  </span>
);
