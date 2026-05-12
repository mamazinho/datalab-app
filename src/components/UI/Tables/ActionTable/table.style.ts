import styled from 'styled-components';

export const StyledTable = styled.table`
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  font-family: ${({ theme }) => theme.fonts.main};
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 1rem;

  & thead th {
    padding: 0.7rem 1.2rem;
    background: ${({ theme }) => theme.colors.inputBackground};
    border-bottom: 1px solid ${({ theme }) => theme.colors.border};
    font-size: 0.78rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: ${({ theme }) => theme.colors.textSecondary};
    text-align: left;
    white-space: nowrap;
  }

  & thead th:last-child {
    width: 2.5rem;
    padding: 0.7rem 0.8rem;
  }

  & tbody tr {
    transition: background-color 0.15s ease;
  }

  & tbody tr:hover {
    background: ${({ theme }) => theme.colors.inputBackground};
  }

  & tbody td {
    padding: 0.85rem 1.2rem;
    font-size: 0.88rem;
    color: ${({ theme }) => theme.colors.text};
    border-bottom: 1px solid ${({ theme }) => theme.colors.border};
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  & tbody td:last-child {
    padding: 0.85rem 0.8rem;
    width: 2.5rem;
    text-align: center;
    overflow: visible;
  }

  & tbody tr:last-child td {
    border-bottom: 0;
  }
`;

export const ActionsTrigger = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 0.45rem;
  border: 0;
  background: transparent;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 1.25rem;
  line-height: 1;
  cursor: pointer;
  font-family: ${({ theme }) => theme.fonts.main};
  transition: background-color 0.18s ease, color 0.18s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.surfaceAlt};
    color: ${({ theme }) => theme.colors.text};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
  }
`;

export const ActionsMenu = styled.div`
  position: fixed;
  z-index: 200;
  min-width: 10rem;
  padding: 0.35rem;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 0.75rem;
  box-shadow: 0 8px 24px ${({ theme }) => theme.colors.shadow};
`;

export const ActionItem = styled.button`
  display: block;
  width: 100%;
  padding: 0.55rem 0.75rem;
  border-radius: 0.5rem;
  border: 0;
  background: transparent;
  color: ${({ theme }) => theme.colors.text};
  font-size: 0.85rem;
  font-weight: 500;
  font-family: ${({ theme }) => theme.fonts.main};
  text-align: left;
  cursor: pointer;
  transition: background-color 0.15s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.inputBackground};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;
