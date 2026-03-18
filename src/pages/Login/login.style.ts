import { Link } from 'react-router-dom';
import styled from 'styled-components';
import {
  AuthCard,
  AuthForm,
  AuthHeader,
  AuthShell,
  BrandHighlight,
  BrandTitle,
  Description,
  DividerLine,
  DividerText,
  Field,
  FieldsWrapper,
  FooterLinks,
  FormDivider,
  Input,
  Label,
  PrimaryButton,
  Subtitle,
} from '../../styles/design-system.style';

export const LoginContainer = styled.div`
  width: 100%;
  min-height: 100%;
`;

export const LoginShell = styled(AuthShell)``;
export const LoginCard = styled(AuthCard)``;
export const LoginHeader = styled(AuthHeader)``;
export const LoginTitle = styled(BrandTitle)``;
export const LoginHighlight = styled(BrandHighlight)``;
export const LoginSubtitle = styled(Subtitle)``;
export const LoginDescription = styled(Description)``;
export const LoginForm = styled(AuthForm)``;
export const LoginFieldset = styled(FieldsWrapper)``;
export const LoginField = styled(Field)``;
export const LoginLabel = styled(Label)``;
export const LoginInput = styled(Input)``;
export const LoginButton = styled(PrimaryButton)`
  margin-top: 0.35rem;
`;

export const LoginDivider = styled(FormDivider)``;
export const LoginDividerLine = styled(DividerLine)``;
export const LoginDividerText = styled(DividerText)``;

export const LoginFooterLinks = styled(FooterLinks)`
  margin-top: 1.25rem;
`;

export const LoginRegisterLink = styled(Link)`
  color: ${({ theme }) => theme.colors.primary};
  font-weight: 700;
  font-size: 0.92rem;
  transition: color 0.18s ease;

  &:hover {
    color: ${({ theme }) => theme.colors.text};
  }
`;

export const LoginForgotLink = styled(Link)`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-weight: 600;
  font-size: 0.84rem;
  transition: color 0.18s ease;

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

export const LoginSocialDescription = styled(Description)`
  margin-top: 0;
`;

export const LoginSocialWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
`;

export const LoginFormTitle = styled.div`
  display: flex;
  justify-content: center;
`;

export const LoginInlineBrand = styled.span`
  color: ${({ theme }) => theme.colors.primary};
`;
