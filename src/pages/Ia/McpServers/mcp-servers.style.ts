import styled from 'styled-components';

export const McpName = styled.span`
  font-size: 0.88rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
`;

export const McpUrl = styled.span`
  display: block;
  max-width: 22rem;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 0.8rem;
  font-family: monospace;
  color: ${({ theme }) => theme.colors.text};
`;

export const McpTestButton = styled.button`
  align-self: flex-start;
  padding: 0.5rem 1rem;
  border-radius: 0.65rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: transparent;
  color: ${({ theme }) => theme.colors.text};
  font-size: 0.85rem;
  font-weight: 600;
  font-family: ${({ theme }) => theme.fonts.main};
  cursor: pointer;
  transition: background-color 0.18s ease;

  &:hover:enabled { background: ${({ theme }) => theme.colors.inputBackground}; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

export const McpTestSuccess = styled.p`
  margin: 0;
  font-size: 0.82rem;
  color: ${({ theme }) => theme.colors.success};
`;
