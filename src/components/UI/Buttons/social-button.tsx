import React from 'react';
import styled from 'styled-components';

export interface ISocialButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  icon: React.ReactNode;
}

const Button = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  border-radius: 0.85rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  font-weight: 600;
  padding: 0.78rem 1rem;
  box-shadow: 0 8px 14px ${({ theme }) => theme.colors.shadow};
  transition: transform 0.16s ease, box-shadow 0.16s ease, filter 0.16s ease;

  &:hover {
    filter: brightness(0.98);
    box-shadow: 0 12px 18px ${({ theme }) => theme.colors.shadow};
    cursor: pointer;
  }

  &:active {
    transform: scale(0.985);
  }

  &:disabled {
    opacity: 0.72;
    cursor: not-allowed;
    transform: none;
    filter: none;
  }
`;

export const SocialIcon = styled.svg`
  width: 1.25rem;
  height: 1.25rem;
  flex-shrink: 0;
`;

// Casca comum dos botões de login social — só o ícone e o rótulo mudam.
export const SocialButton: React.FC<ISocialButtonProps> = ({ label, icon, ...props }) => (
  <Button type="button" {...props}>
    {icon}
    {label}
  </Button>
);
