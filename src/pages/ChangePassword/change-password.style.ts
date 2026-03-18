import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { AuthCard, AuthShell, FooterLinks } from '../../styles/design-system.style';

export const ChangePasswordContainer = styled.div`
  width: 100%;
  min-height: 100%;
`;

export const ChangePasswordShell = styled(AuthShell)``;
export const ChangePasswordCard = styled(AuthCard)``;

export const ChangePasswordFooter = styled(FooterLinks)``;

export const ChangePasswordCancelLink = styled(Link)`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-weight: 600;

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }
`;
