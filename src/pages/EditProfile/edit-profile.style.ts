import styled from 'styled-components';

export const EditProfileContainer = styled.section`
  width: min(100%, 44rem);
  margin: 0 auto;
  border-radius: 1rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  box-shadow: 0 12px 22px ${({ theme }) => theme.colors.shadow};
  padding: 1.5rem;
`;

export const EditProfileTitle = styled.h1`
  margin: 0 0 0.45rem;
  font-size: 1.45rem;
  color: ${({ theme }) => theme.colors.text};
`;

export const EditProfileSubtitle = styled.p`
  margin: 0 0 1.2rem;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export const EditProfileInfo = styled.div`
  border-radius: 0.8rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.inputBackground};
  padding: 0.95rem;
  color: ${({ theme }) => theme.colors.text};
`;
