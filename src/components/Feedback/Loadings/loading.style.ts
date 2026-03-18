import styled from 'styled-components';

export const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
`;

export const Spinner = styled.div`
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  border: 4px solid ${({ theme }) => theme.colors.border};
  border-top-color: ${({ theme }) => theme.colors.primary};
  animation: spin 0.8s linear infinite;
`;

export const LoadingText = styled.h2`
  margin-top: 0.75rem;
  font-size: 0.78rem;
  letter-spacing: 0.09em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.primary};
  animation: pulse 1.2s ease-in-out infinite;
`;
