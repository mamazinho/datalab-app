import styled from 'styled-components';

export const ClientErrorInfo = styled.div`
  text-align: center;
  padding: 1rem;
  opacity: 0.75;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export const ClientErrorCode = styled.span`
  font-size: 0.75rem;
  font-family: monospace;
`;

export const ServerErrorBox = styled.div`
  border-left: 4px solid ${({ theme }) => theme.colors.error};
  border-radius: 0.5rem;
  margin: 1rem;
  padding: 1rem;
  background: color-mix(in srgb, ${({ theme }) => theme.colors.error} 10%, ${({ theme }) => theme.colors.surface});
  box-shadow: 0 8px 14px ${({ theme }) => theme.colors.shadow};
`;

export const Header = styled.div`
  display: flex;
  align-items: center;
`;

export const AlertIcon = styled.svg`
  width: 1.5rem;
  height: 1.5rem;
  margin-right: 0.5rem;
  color: ${({ theme }) => theme.colors.error};
`;

export const Title = styled.h4`
  margin: 0;
  font-size: 1.05rem;
  color: ${({ theme }) => theme.colors.error};
`;

export const Text = styled.p`
  margin: 0.6rem 0 0;
  font-size: 0.88rem;
  color: ${({ theme }) => theme.colors.text};
`;

export const Footer = styled.div`
  margin-top: 0.8rem;
  padding-top: 0.7rem;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.8rem;
`;

export const ErrorMessageCode = styled.code`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  background: ${({ theme }) => theme.colors.inputBackground};
  border-radius: 0.4rem;
  padding: 0.12rem 0.35rem;
`;

export const RetryButton = styled.button`
  border-radius: 0.55rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.primary};
  padding: 0.45rem 0.75rem;
  font-size: 0.83rem;
  font-weight: 600;
  cursor: pointer;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;
