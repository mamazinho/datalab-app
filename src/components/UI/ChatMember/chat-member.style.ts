import styled from 'styled-components';
import { Avatar } from '../Avatar';

export const ChatMemberWrapper = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  min-width: 0;
`;

export const ChatMemberAvatar = styled(Avatar)`
  width: 1.4rem;
  height: 1.4rem;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
`;

export const ChatMemberName = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;
