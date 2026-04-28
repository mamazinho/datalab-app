import styled from 'styled-components';

export const DropdownWrapper = styled.div`
  position: relative;
  display: inline-flex;
  align-items: center;
`;

export const DropdownTrigger = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.3rem 0.65rem 0.3rem 0.85rem;
  border-radius: 0.6rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.inputBackground};
  color: ${({ theme }) => theme.colors.text};
  font-size: 0.88rem;
  font-weight: 600;
  font-family: ${({ theme }) => theme.fonts.main};
  cursor: pointer;
  transition: background-color 0.18s ease, border-color 0.18s ease;
  max-width: 13rem;

  &:hover {
    background: ${({ theme }) => theme.colors.surfaceAlt};
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

export const DropdownTriggerName = styled.span`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
  flex: 1;
`;

export const DropdownChevron = styled.svg`
  flex-shrink: 0;
  width: 0.9rem;
  height: 0.9rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  transition: transform 0.18s ease;
`;

export const DropdownMenu = styled.div`
  position: absolute;
  top: calc(100% + 0.5rem);
  left: 0;
  min-width: 14rem;
  max-width: 18rem;
  border-radius: 0.8rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  box-shadow: 0 14px 24px ${({ theme }) => theme.colors.shadow};
  overflow: hidden;
  z-index: 120;
`;

export const DropdownMenuLabel = styled.p`
  margin: 0;
  padding: 0.6rem 0.85rem;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: ${({ theme }) => theme.colors.textSecondary};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

export const DropdownItem = styled.button<{ $active?: boolean }>`
  width: 100%;
  border: 0;
  background: ${({ theme, $active }) => $active ? theme.colors.surfaceAlt : 'transparent'};
  cursor: pointer;
  text-align: left;
  padding: 0.7rem 0.85rem;
  color: ${({ theme }) => theme.colors.text};
  font-size: 0.88rem;
  font-weight: ${({ $active }) => $active ? '700' : '500'};
  font-family: ${({ theme }) => theme.fonts.main};
  transition: background-color 0.16s ease;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    background: ${({ theme }) => theme.colors.inputBackground};
  }
`;

export const ActiveDot = styled.span`
  width: 0.45rem;
  height: 0.45rem;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.primary};
  flex-shrink: 0;
`;
