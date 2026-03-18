import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { AuthCard, AuthShell, FooterLinks } from '../../styles/design-system.style';

export const RegisterContainer = styled.div`
  width: 100%;
  min-height: 100%;
`;

export const RegisterShell = styled(AuthShell)``;
export const RegisterCard = styled(AuthCard)``;

export const RegisterFooter = styled(FooterLinks)`
  margin-top: 1.25rem;
`;

export const RegisterFooterLink = styled(Link)`
  color: ${({ theme }) => theme.colors.primary};
  font-weight: 700;
  transition: color 0.18s ease;

  &:hover {
    color: ${({ theme }) => theme.colors.text};
  }
`;
