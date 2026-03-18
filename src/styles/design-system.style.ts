import styled, { css } from 'styled-components';

export const AuthShell = styled.div`
  min-height: 80vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
`;

export const AuthCard = styled.section`
  width: 100%;
  max-width: 30rem;
  padding: 2rem;
  border-radius: 1.25rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  box-shadow: 0 18px 32px ${({ theme }) => theme.colors.shadow};
`;

export const AuthHeader = styled.header`
  text-align: center;
  margin-bottom: 2rem;
`;

export const BrandTitle = styled.h1`
  margin: 0 0 0.5rem;
  font-size: 1.9rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: ${({ theme }) => theme.colors.text};
`;

export const BrandHighlight = styled.span`
  color: ${({ theme }) => theme.colors.primary};
`;

export const Subtitle = styled.h2`
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export const Description = styled.p`
  margin: 0.65rem 0 0;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 0.92rem;
`;

export const AuthForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
`;

export const FieldsWrapper = styled.fieldset`
  margin: 0;
  padding: 0;
  border: 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

export const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
`;

export const Label = styled.label`
  padding-left: 0.25rem;
  font-size: 0.87rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
`;

export const inputBaseStyles = css`
  width: 100%;
  padding: 0.82rem 1rem;
  border-radius: 0.85rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.inputBackground};
  color: ${({ theme }) => theme.colors.text};
  outline: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease;

  &::placeholder {
    color: ${({ theme }) => theme.colors.textSecondary};
    opacity: 0.8;
  }

  &:focus {
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px rgba(255, 190, 0, 0.25);
    background: ${({ theme }) => theme.colors.surface};
  }

  &:disabled {
    opacity: 0.72;
    cursor: not-allowed;
  }
`;

export const Input = styled.input`
  ${inputBaseStyles}
`;

export const ErrorText = styled.p`
  margin: 0.3rem 0 0;
  padding-left: 0.3rem;
  color: ${({ theme }) => theme.colors.error};
  font-size: 0.78rem;
  font-weight: 500;
`;

const baseButtonStyles = css`
  width: 100%;
  border: 1px solid transparent;
  border-radius: 0.85rem;
  padding: 0.88rem 1rem;
  font-weight: 700;
  transition: transform 0.16s ease, filter 0.16s ease, box-shadow 0.16s ease;
  cursor: pointer;

  &:disabled {
    opacity: 0.72;
    cursor: not-allowed;
    transform: none;
    filter: none;
  }

  &:not(:disabled):active {
    transform: scale(0.985);
  }
`;

export const PrimaryButton = styled.button`
  ${baseButtonStyles}
  color: ${({ theme }) => theme.colors.primaryText};
  background: ${({ theme }) => theme.colors.primary};
  box-shadow: 0 10px 18px rgba(255, 190, 0, 0.3);

  &:not(:disabled):hover {
    filter: brightness(0.95);
    box-shadow: 0 12px 22px rgba(255, 190, 0, 0.38);
  }
`;

export const SecondaryButton = styled.button`
  ${baseButtonStyles}
  color: ${({ theme }) => theme.colors.text};
  background: transparent;
  border-color: ${({ theme }) => theme.colors.border};

  &:not(:disabled):hover {
    background: ${({ theme }) => theme.colors.inputBackground};
  }
`;

export const FormDivider = styled.div`
  position: relative;
  margin: 0.65rem 0;
`;

export const DividerLine = styled.div`
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`;

export const DividerText = styled.span`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 0.85rem;
  background: ${({ theme }) => theme.colors.surface};
  padding: 0 0.55rem;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export const FooterLinks = styled.div`
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
`;

export const TextLink = styled.a`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-weight: 600;
  font-size: 0.92rem;
  transition: color 0.18s ease;

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }
`;