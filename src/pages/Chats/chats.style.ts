import styled from 'styled-components';

export const ChatContainer = styled.div`
  width: 100%;
`;

export const ChatPageContent = styled.div`
  width: min(100%, 66rem);
  margin: 0 auto;
  padding: 0.5rem 0;
`;

export const ChatHeaderCard = styled.section`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.35rem;
  margin-bottom: 1rem;
  border-radius: 1rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  box-shadow: 0 10px 18px ${({ theme }) => theme.colors.shadow};

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

export const ChatHeaderTitle = styled.h1`
  margin: 0;
  font-size: 1.5rem;
  color: ${({ theme }) => theme.colors.text};
`;

export const ChatHeaderText = styled.p`
  margin: 0.25rem 0 0;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 0.9rem;
`;

export const ChatListCard = styled.section`
  padding: 1.35rem;
  border-radius: 1rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  box-shadow: 0 10px 18px ${({ theme }) => theme.colors.shadow};
`;

export const ChatListTitle = styled.h3`
  margin: 0 0 1rem;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.15rem;
  color: ${({ theme }) => theme.colors.text};
`;

export const ChatListTitleBadge = styled.span`
  width: 1.8rem;
  height: 1.8rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.6rem;
  background: ${({ theme }) => theme.colors.surfaceAlt};
`;
