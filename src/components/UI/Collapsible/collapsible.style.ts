import styled from 'styled-components';

export const CollapsibleWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
`;

export const CollapsibleTrigger = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  align-self: flex-start;
  padding: 0.2rem 0;
  border: 0;
  background: transparent;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 0.8rem;
  font-weight: 600;
  font-family: ${({ theme }) => theme.fonts.main};
  cursor: pointer;
  transition: color 0.18s ease;

  &:hover:enabled { color: ${({ theme }) => theme.colors.primary}; }
  &:disabled { cursor: not-allowed; }
  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
    border-radius: 0.3rem;
  }
`;

export const CollapsibleChevron = styled.svg<{ $isOpen: boolean }>`
  width: 0.8rem;
  height: 0.8rem;
  transition: transform 0.18s ease;
  transform: ${({ $isOpen }) => ($isOpen ? 'rotate(180deg)' : 'none')};
`;

export const CollapsibleContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
  padding-left: 0.85rem;
  border-left: 2px solid ${({ theme }) => theme.colors.border};

  &[hidden] { display: none; }
`;
