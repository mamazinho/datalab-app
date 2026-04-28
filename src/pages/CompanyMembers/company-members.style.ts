import styled from 'styled-components';

export const MembersPageContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

export const MembersPageHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
`;

export const MembersPageTitle = styled.h1`
  margin: 0;
  font-size: 1.4rem;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.text};
`;

export const MembersPageSubtitle = styled.p`
  margin: 0.3rem 0 0;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export const InviteMemberButton = styled.button`
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

  &:hover { opacity: 0.88; }
`;

export const MembersTable = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 1rem;
  overflow: hidden;
`;

export const MembersTableHeader = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr auto auto;
  gap: 1rem;
  padding: 0.7rem 1.2rem;
  background: ${({ theme }) => theme.colors.inputBackground};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

export const MembersTableHeaderCell = styled.span`
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export const MembersTableRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr auto auto;
  gap: 1rem;
  align-items: center;
  padding: 0.85rem 1.2rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};

  &:last-child { border-bottom: 0; }

  &:hover { background: ${({ theme }) => theme.colors.inputBackground}; }
`;

export const MembersTableCell = styled.div`
  font-size: 0.88rem;
  color: ${({ theme }) => theme.colors.text};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const MembersTableCellSecondary = styled.span`
  font-size: 0.78rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  display: block;
`;

export const RoleBadge = styled.span<{ $owner: boolean }>`
  display: inline-block;
  padding: 0.2rem 0.6rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 700;
  background: ${({ theme, $owner }) => $owner ? theme.colors.primary : theme.colors.inputBackground};
  color: ${({ theme, $owner }) => $owner ? theme.colors.primaryText : theme.colors.textSecondary};
  border: 1px solid ${({ theme, $owner }) => $owner ? 'transparent' : theme.colors.border};
`;

export const MemberActionsCell = styled.div`
  display: inline-flex;
  gap: 0.4rem;
`;

export const MemberActionButton = styled.button`
  padding: 0.3rem 0.65rem;
  border-radius: 0.45rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: transparent;
  color: ${({ theme }) => theme.colors.text};
  font-size: 0.78rem;
  font-weight: 600;
  font-family: ${({ theme }) => theme.fonts.main};
  cursor: pointer;
  transition: background-color 0.18s ease;
  white-space: nowrap;

  &:hover { background: ${({ theme }) => theme.colors.inputBackground}; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

export const MemberRemoveButton = styled(MemberActionButton)`
  border-color: ${({ theme }) => theme.colors.error};
  color: ${({ theme }) => theme.colors.error};

  &:hover { background: ${({ theme }) => theme.colors.error}; color: #fff; }
`;

export const MembersEmpty = styled.p`
  margin: 0;
  padding: 2rem;
  text-align: center;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

// Modal forms shared styles
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

export const ModalInput = styled.input`
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

export const ModalSelect = styled.select`
  padding: 0.65rem 0.85rem;
  border-radius: 0.6rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.inputBackground};
  color: ${({ theme }) => theme.colors.text};
  font-size: 0.9rem;
  font-family: ${({ theme }) => theme.fonts.main};
  width: 100%;
  cursor: pointer;
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

// Permission toggles
export const PermissionsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  max-height: 22rem;
  overflow-y: auto;
`;

export const PermissionGroup = styled.div`
  margin-bottom: 0.5rem;
`;

export const PermissionGroupLabel = styled.p`
  margin: 0 0 0.3rem;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: ${({ theme }) => theme.colors.textSecondary};
  padding: 0.4rem 0 0.2rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

export const PermissionToggleRow = styled.label`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.5rem 0.2rem;
  cursor: pointer;
  border-radius: 0.4rem;
  transition: background-color 0.15s ease;

  &:hover { background: ${({ theme }) => theme.colors.inputBackground}; }
`;

export const PermissionToggleInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  min-width: 0;
`;

export const PermissionToggleName = styled.span`
  font-size: 0.85rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
`;

export const PermissionToggleDesc = styled.span`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const PermissionToggleMethod = styled.span`
  font-size: 0.7rem;
  font-weight: 700;
  padding: 0.1rem 0.35rem;
  border-radius: 0.3rem;
  background: ${({ theme }) => theme.colors.surfaceAlt};
  color: ${({ theme }) => theme.colors.textSecondary};
  border: 1px solid ${({ theme }) => theme.colors.border};
  flex-shrink: 0;
  font-family: monospace;
`;

export const ToggleSwitch = styled.input.attrs({ type: 'checkbox' })`
  appearance: none;
  width: 2rem;
  height: 1.1rem;
  border-radius: 999px;
  background: ${({ theme }) => theme.colors.border};
  cursor: pointer;
  position: relative;
  transition: background-color 0.2s ease;
  flex-shrink: 0;

  &::after {
    content: '';
    position: absolute;
    width: 0.8rem;
    height: 0.8rem;
    border-radius: 50%;
    background: #fff;
    top: 0.15rem;
    left: 0.15rem;
    transition: left 0.2s ease;
  }

  &:checked {
    background: ${({ theme }) => theme.colors.primary};
    &::after { left: calc(100% - 0.95rem); }
  }
`;
