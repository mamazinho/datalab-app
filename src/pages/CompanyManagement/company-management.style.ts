import styled from 'styled-components';

export const CompanyPageContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

export const CompanyPageHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
`;

export const CompanyPageTitle = styled.h1`
  margin: 0;
  font-size: 1.4rem;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.text};
`;

export const CompanyPageSubtitle = styled.p`
  margin: 0.3rem 0 0;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export const CompanyRow = styled.div<{ $active: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
  padding: 1rem 1.2rem;
  border-radius: 1rem;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme, $active }) => $active ? theme.colors.primary : theme.colors.border};
`;

export const CompanyInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-width: 0;
`;

export const CompanyName = styled.span`
  font-size: 1rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
`;

export const ActiveBadge = styled.span`
  align-self: flex-start;
  padding: 0.15rem 0.55rem;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 700;
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.primaryText};
`;

export const CompanyActions = styled.div`
  display: inline-flex;
  gap: 0.4rem;
  flex-wrap: wrap;
`;

export const CompanyActionButton = styled.button`
  padding: 0.4rem 0.85rem;
  border-radius: 0.5rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: transparent;
  color: ${({ theme }) => theme.colors.text};
  font-size: 0.82rem;
  font-weight: 600;
  font-family: ${({ theme }) => theme.fonts.main};
  cursor: pointer;
  transition: background-color 0.18s ease;
  white-space: nowrap;

  &:hover { background: ${({ theme }) => theme.colors.inputBackground}; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

export const CompanyDeleteButton = styled(CompanyActionButton)`
  border-color: ${({ theme }) => theme.colors.error};
  color: ${({ theme }) => theme.colors.error};

  &:hover { background: ${({ theme }) => theme.colors.error}; color: #fff; }
`;

// Modal de confirmação de deleção
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

export const ModalHint = styled.p`
  margin: 0;
  font-size: 0.85rem;
  color: ${({ theme }) => theme.colors.textSecondary};
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

export const ModalDeleteSubmit = styled(ModalSubmit)`
  background: ${({ theme }) => theme.colors.error};
  color: #fff;
`;
