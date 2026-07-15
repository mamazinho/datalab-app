import styled from 'styled-components';

export const ModelSelectWrapper = styled.div`
  position: relative;
  min-width: 15rem;
`;

export const ModelSelectButton = styled.button`
  width: 100%;
  text-align: left;
  border-radius: 0.7rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.inputBackground};
  color: ${({ theme }) => theme.colors.text};
  padding: 0.7rem 2rem 0.7rem 0.85rem;
  outline: none;
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23999%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E");
  background-repeat: no-repeat;
  background-position: right 0.85rem top 50%;
  background-size: 0.65rem auto;

  &:focus, &[aria-expanded="true"] {
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px rgba(255, 190, 0, 0.2);
  }

  &:disabled {
    opacity: 0.65;
    cursor: not-allowed;
  }
`;

export const ModelSelectList = styled.div<{ $direction: 'up' | 'down' }>`
  position: absolute;
  ${({ $direction }) => ($direction === 'up' ? 'bottom: calc(100% + 0.5rem);' : 'top: calc(100% + 0.5rem);')}
  left: 0;
  width: 100%;
  min-width: 15rem;
  max-height: 22rem;
  overflow-y: auto;
  border-radius: 0.7rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  box-shadow: 0 4px 14px ${({ theme }) => theme.colors.shadow};
  z-index: 100;
  padding: 0.5rem 0;
`;

export const ModelProviderGroup = styled.div`
  margin-bottom: 0.5rem;

  &:last-child {
    margin-bottom: 0;
  }
`;

export const ModelProviderLabel = styled.div`
  padding: 0.5rem 0.85rem;
  font-size: 0.95rem;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.text};
  background: ${({ theme }) => theme.colors.inputBackground};
  border-bottom: 2px solid ${({ theme }) => theme.colors.primary};
  margin-bottom: 0.25rem;
`;

export const ModelOptionItem = styled.div<{ $isSelected?: boolean }>`
  padding: 0.55rem 0.85rem 0.55rem 1.25rem;
  font-size: 0.85rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  cursor: pointer;
  transition: background 0.1s ease;
  background: ${({ $isSelected }) => $isSelected ? 'rgba(255, 190, 0, 0.15)' : 'transparent'};
  font-weight: ${({ $isSelected }) => $isSelected ? '700' : '400'};

  &:hover {
    background: ${({ theme }) => theme.colors.inputBackground};
    color: ${({ theme }) => theme.colors.text};
  }
`;

export const ModelOptionExpand = styled.div`
  padding: 0.5rem 0.85rem;
  font-size: 0.8rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textSecondary};
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.35rem;

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
    background: ${({ theme }) => theme.colors.inputBackground};
  }
`;
