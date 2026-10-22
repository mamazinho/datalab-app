import styled, { css } from 'styled-components';

export const IaContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

export const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

export const PageHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
`;

export const PageTitle = styled.h1`
  margin: 0;
  font-size: 1.4rem;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.text};
`;

export const PageSubtitle = styled.p`
  margin: 0.3rem 0 0;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export const CreateButton = styled.button`
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

export const EmptyMessage = styled.p`
  margin: 0;
  padding: 2rem;
  text-align: center;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

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

export const ModalHint = styled.p`
  margin: 0;
  font-size: 0.78rem;
  color: ${({ theme }) => theme.colors.textSecondary};
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
  &:disabled { opacity: 0.6; cursor: not-allowed; }
`;

export const ModalInput = styled.input`
  ${inputStyles}
`;

export const ModalTextarea = styled.textarea`
  ${inputStyles}
  resize: vertical;
  min-height: 5.5rem;
`;

export const ModalSelect = styled.select`
  ${inputStyles}
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

  &:hover:enabled { opacity: 0.88; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;
