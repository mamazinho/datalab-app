import styled, { css } from 'styled-components';

export const StepsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

export const StepsContentWrapper = styled.div`
  position: relative;
`;

export const StepsNavigation = styled.div`
  min-height: 1.5rem;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const stepNavButtonBase = css`
  display: inline-flex;
  align-items: center;
  border: 0;
  background: transparent;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 0.86rem;
  font-weight: 600;
  cursor: pointer;
  transition: color 0.2s ease;

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

export const StepNavButton = styled.button`
  ${stepNavButtonBase}
`;

export const StepNavIcon = styled.svg<{ $direction: 'left' | 'right' }>`
  width: 1rem;
  height: 1rem;
  transition: transform 0.2s ease;

  ${({ $direction }) =>
    $direction === 'left'
      ? css`
          margin-right: 0.35rem;
          ${StepNavButton}:hover & {
            transform: translateX(-3px);
          }
        `
      : css`
          margin-left: 0.35rem;
          ${StepNavButton}:hover & {
            transform: translateX(3px);
          }
        `}
`;

export const ProgressBarWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  padding: 0 0.5rem;
`;

export const ProgressStep = styled.div`
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const ProgressStepButton = styled.button<{ $isActive: boolean; $isClickable: boolean }>`
  width: 2rem;
  height: 2rem;
  border-radius: 999px;
  border: 2px solid;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.82rem;
  font-weight: 700;
  transition: transform 0.2s ease, filter 0.2s ease, border-color 0.2s ease;
  cursor: ${({ $isClickable }) => ($isClickable ? 'pointer' : 'default')};
  background: ${({ theme, $isActive }) => ($isActive ? theme.colors.primary : theme.colors.surface)};
  border-color: ${({ theme, $isActive }) => ($isActive ? theme.colors.primary : theme.colors.border)};
  color: ${({ theme, $isActive }) => ($isActive ? theme.colors.primaryText : theme.colors.textSecondary)};

  &:focus-visible {
    outline: 0;
    box-shadow: 0 0 0 3px rgba(255, 190, 0, 0.25);
  }

  &:not(:disabled):hover {
    filter: ${({ $isClickable }) => ($isClickable ? 'brightness(0.95)' : 'none')};
    transform: ${({ $isClickable }) => ($isClickable ? 'translateY(-1px)' : 'none')};
  }
`;

export const ProgressConnector = styled.div<{ $isActive: boolean }>`
  position: absolute;
  top: 50%;
  left: 50%;
  width: 100%;
  height: 2px;
  transform: translateY(-50%);
  background: ${({ theme, $isActive }) => ($isActive ? theme.colors.primary : theme.colors.border)};
  transition: background 0.2s ease;
`;
