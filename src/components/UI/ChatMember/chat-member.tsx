import type { IChatMember } from '../../../services/datalab-api/chatsResource';
import { ChatMemberAvatar, ChatMemberName, ChatMemberWrapper } from './chat-member.style';

export const ChatMember = ({ member }: { member: IChatMember }) => (
  <ChatMemberWrapper>
    <ChatMemberAvatar src={member.avatar_url} name={member.name} alt="" />
    <ChatMemberName>{member.name}</ChatMemberName>
  </ChatMemberWrapper>
);
