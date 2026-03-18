import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { AuthCard, AuthShell, FooterLinks } from '../../styles/design-system.style';

export const ForgotPasswordContainer = styled.div`
  width: 100%;
  min-height: 100%;
`;

export const ForgotPasswordShell = styled(AuthShell)``;
export const ForgotPasswordCard = styled(AuthCard)``;

export const ForgotPasswordFooter = styled(FooterLinks)``;

export const ForgotPasswordBackLink = styled(Link)`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-weight: 600;

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }
`;
