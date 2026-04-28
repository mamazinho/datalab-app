import styled from 'styled-components';

export const InvitesMenuWrapper = styled.div`
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
`;

export const InvitesMenuToggle = styled.button`
  width: 100%;
  border: 0;
  background: transparent;
  cursor: pointer;
  text-align: left;
  padding: 0.75rem 0.85rem;
  color: ${({ theme }) => theme.colors.text};
  font-size: 0.88rem;
  font-weight: 600;
  font-family: ${({ theme }) => theme.fonts.main};
  transition: background-color 0.16s ease;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;

  &:hover {
    background: ${({ theme }) => theme.colors.inputBackground};
  }
`;

export const InvitesMenuToggleLabel = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
`;

export const InvitesBadge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 1.2rem;
  height: 1.2rem;
  padding: 0 0.3rem;
  border-radius: 999px;
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.primaryText};
  font-size: 0.7rem;
  font-weight: 800;
`;

export const InvitesMenuChevron = styled.svg`
  width: 0.85rem;
  height: 0.85rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  transition: transform 0.18s ease;
  flex-shrink: 0;
`;

export const InvitesMenuPanel = styled.div`
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.inputBackground};
`;

export const InvitesTabs = styled.div`
  display: flex;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

export const InvitesTab = styled.button<{ $active: boolean }>`
  flex: 1;
  border: 0;
  background: transparent;
  padding: 0.5rem 0;
  font-size: 0.78rem;
  font-weight: ${({ $active }) => ($active ? '700' : '500')};
  color: ${({ theme, $active }) => ($active ? theme.colors.text : theme.colors.textSecondary)};
  font-family: ${({ theme }) => theme.fonts.main};
  cursor: pointer;
  border-bottom: 2px solid ${({ theme, $active }) => ($active ? theme.colors.primary : 'transparent')};
  transition: color 0.18s ease, border-color 0.18s ease;

  &:hover {
    color: ${({ theme }) => theme.colors.text};
  }
`;

export const InvitesScrollArea = styled.div`
  max-height: 12rem;
  overflow-y: auto;
`;

export const InviteRow = styled.div`
  padding: 0.65rem 0.85rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  flex-direction: column;
  gap: 0.3rem;

  &:last-child {
    border-bottom: 0;
  }
`;

export const InviteRowCompany = styled.span`
  font-size: 0.85rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const InviteRowBy = styled.span`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export const InviteRowActions = styled.div`
  display: inline-flex;
  gap: 0.4rem;
  margin-top: 0.2rem;
`;

export const InviteRowAccept = styled.button`
  padding: 0.28rem 0.65rem;
  border-radius: 0.4rem;
  border: 0;
  background: ${({ theme }) => theme.colors.success};
  color: #fff;
  font-size: 0.75rem;
  font-weight: 700;
  font-family: ${({ theme }) => theme.fonts.main};
  cursor: pointer;
  transition: opacity 0.18s ease;

  &:hover { opacity: 0.85; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

export const InviteRowDecline = styled.button`
  padding: 0.28rem 0.65rem;
  border-radius: 0.4rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: transparent;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 0.75rem;
  font-weight: 700;
  font-family: ${({ theme }) => theme.fonts.main};
  cursor: pointer;
  transition: background-color 0.18s ease;

  &:hover { background: ${({ theme }) => theme.colors.surfaceAlt}; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

export const InvitesEmpty = styled.p`
  margin: 0;
  padding: 0.85rem;
  font-size: 0.82rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  text-align: center;
`;
