import styled from 'styled-components';

export const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background: ${({ theme }) => theme.colors.overlay};
  backdrop-filter: blur(4px);
  animation: floatIn 0.2s ease;
`;

export const Backdrop = styled.div`
  position: absolute;
  inset: 0;
`;

export const Dialog = styled.div`
  position: relative;
  width: 100%;
  max-width: 30rem;
  border-radius: 1rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  box-shadow: 0 18px 32px ${({ theme }) => theme.colors.shadow};
  overflow: hidden;
  animation: floatIn 0.2s ease;
`;

export const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.35rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.inputBackground};
`;

export const Title = styled.h3`
  margin: 0;
  font-size: 1.1rem;
  color: ${({ theme }) => theme.colors.text};
`;

export const CloseButton = styled.button`
  border: 0;
  border-radius: 0.65rem;
  width: 2rem;
  height: 2rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  background: transparent;
  color: ${({ theme }) => theme.colors.textSecondary};
  transition: color 0.16s ease, background-color 0.16s ease;

  &:hover {
    color: ${({ theme }) => theme.colors.text};
    background: ${({ theme }) => theme.colors.surface};
  }
`;

export const CloseIcon = styled.svg`
  width: 1.2rem;
  height: 1.2rem;
`;

export const Body = styled.div`
  padding: 1.2rem 1.35rem 1.35rem;
`;
