import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { Input, Label, PrimaryButton } from '../../../styles/design-system.style';

export const EmptyChatList = styled.div`
  text-align: center;
  padding: 2rem;
  border-radius: 0.85rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.textSecondary};
  font-style: italic;
  background: ${({ theme }) => theme.colors.inputBackground};
`;

export const ChatListWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

export const ChatItemLink = styled(Link)`
  display: block;
`;

export const ChatItemCard = styled.div`
  border-radius: 0.85rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  padding: 0.9rem 1rem;
  box-shadow: 0 6px 12px ${({ theme }) => theme.colors.shadow};
  transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-1px);
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 10px 18px ${({ theme }) => theme.colors.shadow};
  }
`;

export const ChatTitle = styled.h5`
  margin: 0;
  font-size: 1rem;
  color: ${({ theme }) => theme.colors.text};
`;

export const CreateChatButton = styled.button`
  border: 0;
  border-radius: 0.75rem;
  padding: 0.62rem 0.95rem;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.primaryText};
  background: ${({ theme }) => theme.colors.primary};
  transition: filter 0.18s ease, transform 0.18s ease;

  &:hover {
    filter: brightness(0.95);
  }

  &:active {
    transform: scale(0.985);
  }
`;

export const CreateChatIcon = styled.svg`
  width: 1.1rem;
  height: 1.1rem;
`;

export const CreateChatForm = styled.form``;

export const CreateChatFieldset = styled.fieldset`
  border: 0;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
`;

export const CreateChatField = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
`;

export const CreateChatLabel = styled(Label)``;

export const CreateChatInput = styled(Input)``;

export const CreateChatActions = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 0.2rem;
`;

export const CreateChatSubmit = styled(PrimaryButton)`
  width: auto;
  min-width: 7rem;
  padding-inline: 1.2rem;
`;
