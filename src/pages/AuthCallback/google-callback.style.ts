import styled from 'styled-components';

export const CallbackContainer = styled.div`
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 1rem;
`;

export const CallbackCard = styled.div`
  width: min(100%, 26rem);
  border-radius: 1rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  box-shadow: 0 14px 24px ${({ theme }) => theme.colors.shadow};
  padding: 1.5rem;
  text-align: center;
`;

export const CallbackSpinner = styled.div`
  width: 3rem;
  height: 3rem;
  margin: 0 auto 1rem;
  border-radius: 50%;
  border: 4px solid ${({ theme }) => theme.colors.surfaceAlt};
  border-top-color: ${({ theme }) => theme.colors.primary};
  animation: spin 0.8s linear infinite;
`;

export const CallbackTitle = styled.h2`
  margin: 0;
  font-size: 1.1rem;
  color: ${({ theme }) => theme.colors.text};
`;

export const CallbackText = styled.p`
  margin: 0.5rem 0 0;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 0.88rem;
`;
