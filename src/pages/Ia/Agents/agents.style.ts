import styled, { css } from 'styled-components';
import { Avatar } from '../../../components/UI/Avatar';

export const AgentsPageContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

export const AgentsPageHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
`;

export const AgentsPageTitle = styled.h1`
  margin: 0;
  font-size: 1.4rem;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.text};
`;

export const AgentsPageSubtitle = styled.p`
  margin: 0.3rem 0 0;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export const CreateAgentButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.6rem 1.1rem;
  border-radius: 0.65rem;
  border: 0;
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.primaryText};
  font-size: 0.9rem;
  font-weight: 700;
  font-family: ${({ theme }) => theme.fonts.main};
  cursor: pointer;
  transition: opacity 0.18s ease;

  &:hover:enabled { opacity: 0.88; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

export const AgentsEmpty = styled.p`
  margin: 0;
  padding: 2rem;
  text-align: center;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

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

export const AgentDescription = styled.span`
  display: block;
  max-width: 22rem;
  font-size: 0.84rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const AgentModel = styled.span`
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.text};
  font-family: monospace;
`;

export const AgentBadges = styled.div`
  display: inline-flex;
  flex-wrap: wrap;
  gap: 0.3rem;
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

// Formulário do modal de criar/editar agente
export const ModalForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
`;

export const ModalFieldset = styled.fieldset`
  border: 0;
  padding: 0;
  margin: 0;
  display: contents;
  &:disabled { opacity: 0.6; pointer-events: none; }
`;

export const ModalField = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
`;

export const ModalLabel = styled.label`
  font-size: 0.85rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
`;

const inputStyles = css`
  padding: 0.65rem 0.85rem;
  border-radius: 0.6rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.inputBackground};
  color: ${({ theme }) => theme.colors.text};
  font-size: 0.9rem;
  font-family: ${({ theme }) => theme.fonts.main};
  width: 100%;
  transition: border-color 0.18s ease;

  &:focus { outline: none; border-color: ${({ theme }) => theme.colors.primary}; }
`;

export const ModalInput = styled.input`
  ${inputStyles}
`;

export const ModalTextarea = styled.textarea`
  ${inputStyles}
  resize: vertical;
  min-height: 5.5rem;
`;

export const ModalError = styled.p`
  margin: 0;
  font-size: 0.82rem;
  color: ${({ theme }) => theme.colors.error};
`;

export const ModalSubmit = styled.button`
  padding: 0.7rem 1.4rem;
  border-radius: 0.65rem;
  border: 0;
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.primaryText};
  font-size: 0.9rem;
  font-weight: 700;
  font-family: ${({ theme }) => theme.fonts.main};
  cursor: pointer;
  align-self: flex-end;
  transition: opacity 0.18s ease;

  &:hover { opacity: 0.88; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;
