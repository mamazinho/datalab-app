import styled from 'styled-components';
import { ErrorText, Field, FieldsWrapper, Input, Label, PrimaryButton } from '../../../styles/design-system.style';

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

export const AvatarRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.2rem;
`;

export const AvatarButton = styled.button`
  position: relative;
  border: 0;
  border-radius: 999px;
  width: 7.25rem;
  height: 7.25rem;
  padding: 0;
  cursor: pointer;
  background: transparent;
`;

export const AvatarImage = styled.img`
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid ${({ theme }) => theme.colors.primary};
  box-shadow: 0 10px 18px ${({ theme }) => theme.colors.shadow};
`;

export const AvatarEditIndicator = styled.span`
  position: absolute;
  right: 0;
  bottom: 0;
  width: 2rem;
  height: 2rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  border: 2px solid ${({ theme }) => theme.colors.surface};
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.primaryText};
  font-size: 0.95rem;
  box-shadow: 0 8px 14px ${({ theme }) => theme.colors.shadow};
`;

export const HiddenFileInput = styled.input`
  display: none;
`;

export const AvatarHelpText = styled.p`
  margin: 0.6rem 0 0;
  text-align: center;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 0.8rem;
`;

export const UploadingBadge = styled.span`
  display: inline-block;
  margin-top: 0.45rem;
  color: ${({ theme }) => theme.colors.primary};
  font-size: 0.78rem;
  font-weight: 600;
`;

export const StyledFieldset = styled(FieldsWrapper)`
  gap: 0.9rem;
`;

export const StyledField = styled(Field)``;

export const StyledLabel = styled(Label)``;

export const StyledInput = styled(Input)``;

export const SectionTitle = styled.h3`
  margin-top: 0.95rem;
  font-size: 0.85rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export const StyledSelect = styled.select`
  width: 100%;
  padding: 0.82rem 1rem;
  border-radius: 0.85rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.inputBackground};
  color: ${({ theme }) => theme.colors.text};
  outline: none;

  &:focus {
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px rgba(255, 190, 0, 0.25);
    background: ${({ theme }) => theme.colors.surface};
  }
`;

export const PhoneNumberWrapper = styled.div`
  .PhoneInput {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    border: 1px solid ${({ theme }) => theme.colors.border};
    border-radius: 0.85rem;
    background: ${({ theme }) => theme.colors.inputBackground};
    padding: 0.45rem 0.65rem;
    transition: border-color 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease;
  }

  .PhoneInput:focus-within {
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px rgba(255, 190, 0, 0.25);
    background: ${({ theme }) => theme.colors.surface};
  }

  .PhoneInputCountry {
    margin: 0;
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    padding-right: 0.15rem;
    border-right: 1px solid ${({ theme }) => theme.colors.border};
  }

  .PhoneInputCountrySelect {
    border: 0;
    outline: none;
    background: transparent;
    color: ${({ theme }) => theme.colors.text};
    padding-right: 0.2rem;
    font-size: 0.92rem;
    appearance: none;

    option {
      background: ${({ theme }) => theme.colors.surface};
      color: ${({ theme }) => theme.colors.text};
    }
  }

  .PhoneInputCountryIcon {
    width: 1.15rem;
    height: 0.9rem;
    box-shadow: none;
  }

  .PhoneInputInput {
    border: 0;
    outline: none;
    width: 100%;
    min-width: 0;
    background: transparent;
    color: ${({ theme }) => theme.colors.text};
    font-size: 0.95rem;
    padding: 0.3rem 0.1rem;
  }

  .PhoneInputInput::placeholder {
    color: ${({ theme }) => theme.colors.textSecondary};
    opacity: 0.8;
  }
`;

export const Footer = styled.div`
  margin-top: 0.35rem;
  display: flex;
  justify-content: flex-end;
`;

export const SaveButton = styled(PrimaryButton)`
  width: auto;
  min-width: 11rem;
`;

export const FormError = styled(ErrorText)`
  margin-top: -0.1rem;
`;
