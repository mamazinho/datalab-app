import styled, { css } from 'styled-components';
import { Avatar } from '../../../components/UI/Avatar';
import { TruncatedText } from '../../../components/UI/TruncatedText';

export const AgentCell = styled.div`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  min-width: 0;
`;

export const AgentAvatar = styled(Avatar)`
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
`;

export const AgentIdentity = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  min-width: 0;
`;

export const AgentName = styled.span`
  font-size: 0.88rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const AgentKey = styled.span`
  font-size: 0.74rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-family: monospace;
`;

export const AgentDescription = styled(TruncatedText)`
  max-width: 22rem;
  font-size: 0.84rem;
  line-height: 1.4;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export const AgentModel = styled.span`
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.text};
  font-family: monospace;
`;

export const AgentOwner = styled.span`
  font-size: 0.84rem;
  color: ${({ theme }) => theme.colors.text};
`;

type AgentBadgeVariant = 'system' | 'active' | 'company-disabled' | 'user-disabled';

export const AgentBadge = styled.span<{ $variant: AgentBadgeVariant }>`
  display: inline-block;
  padding: 0.2rem 0.6rem;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 700;
  white-space: nowrap;

  ${({ theme, $variant }) => {
    switch ($variant) {
      case 'active':
        return css`
          background: color-mix(in srgb, ${theme.colors.success} 14%, transparent);
          color: ${theme.colors.success};
          border: 1px solid ${theme.colors.success};
        `;
      case 'company-disabled':
        return css`
          background: color-mix(in srgb, ${theme.colors.error} 12%, transparent);
          color: ${theme.colors.error};
          border: 1px solid ${theme.colors.error};
        `;
      case 'user-disabled':
        return css`
          background: ${theme.colors.inputBackground};
          color: ${theme.colors.textSecondary};
          border: 1px solid ${theme.colors.border};
        `;
      case 'system':
        return css`
          background: transparent;
          color: ${theme.colors.primary};
          border: 1px solid ${theme.colors.primary};
        `;
    }
  }}
`;
