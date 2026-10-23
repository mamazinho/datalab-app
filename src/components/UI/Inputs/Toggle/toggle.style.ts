import styled from 'styled-components';

export const ToggleLabel = styled.label`
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  font-size: 0.87rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;
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
