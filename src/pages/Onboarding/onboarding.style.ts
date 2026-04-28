import styled from 'styled-components';

export const OnboardingWrapper = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
`;

export const OnboardingCard = styled.div`
  width: min(100%, 32rem);
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 1.2rem;
  padding: 2.5rem 2rem;
  box-shadow: 0 14px 32px ${({ theme }) => theme.colors.shadow};
`;

export const OnboardingTitle = styled.h1`
  margin: 0 0 0.4rem;
  font-size: 1.55rem;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.text};
`;

export const OnboardingSubtitle = styled.p`
  margin: 0 0 2rem;
  font-size: 0.95rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  line-height: 1.5;
`;

export const OnboardingForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
`;

export const OnboardingFieldset = styled.fieldset`
  border: 0;
  padding: 0;
  margin: 0;
  display: contents;

  &:disabled {
    opacity: 0.6;
    pointer-events: none;
  }
`;

export const OnboardingField = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
`;

export const OnboardingLabel = styled.label`
  font-size: 0.88rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
`;

export const OnboardingInput = styled.input`
  padding: 0.7rem 0.9rem;
  border-radius: 0.65rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.inputBackground};
  color: ${({ theme }) => theme.colors.text};
  font-size: 0.95rem;
  font-family: ${({ theme }) => theme.fonts.main};
  transition: border-color 0.18s ease;
  width: 100%;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

export const OnboardingSubmit = styled.button`
  padding: 0.75rem 1.5rem;
  border-radius: 0.7rem;
  border: 0;
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.primaryText};
  font-size: 0.95rem;
  font-weight: 700;
  font-family: ${({ theme }) => theme.fonts.main};
  cursor: pointer;
  transition: opacity 0.18s ease;

  &:hover {
    opacity: 0.88;
  }
`;

export const OnboardingError = styled.p`
  margin: 0;
  font-size: 0.85rem;
  color: ${({ theme }) => theme.colors.error};
`;

export const InviteList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

export const InviteItem = styled.li`
  padding: 1rem;
  border-radius: 0.8rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.inputBackground};
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
`;

export const InviteInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  min-width: 0;
`;

export const InviteCompanyName = styled.span`
  font-size: 0.95rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const InviteBy = styled.span`
  font-size: 0.78rem;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export const InviteActions = styled.div`
  display: inline-flex;
  gap: 0.5rem;
  flex-shrink: 0;
`;

export const InviteAcceptButton = styled.button`
  padding: 0.4rem 0.85rem;
  border-radius: 0.5rem;
  border: 0;
  background: ${({ theme }) => theme.colors.success};
  color: #fff;
  font-size: 0.82rem;
  font-weight: 700;
  font-family: ${({ theme }) => theme.fonts.main};
  cursor: pointer;
  transition: opacity 0.18s ease;

  &:hover {
    opacity: 0.85;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const InviteDeclineButton = styled.button`
  padding: 0.4rem 0.85rem;
  border-radius: 0.5rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: transparent;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 0.82rem;
  font-weight: 700;
  font-family: ${({ theme }) => theme.fonts.main};
  cursor: pointer;
  transition: background-color 0.18s ease, color 0.18s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.inputBackground};
    color: ${({ theme }) => theme.colors.text};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const OnboardingDivider = styled.div`
  margin: 1.5rem 0;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  position: relative;
  text-align: center;

  &::after {
    content: 'ou';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: ${({ theme }) => theme.colors.surface};
    padding: 0 0.75rem;
    font-size: 0.8rem;
    color: ${({ theme }) => theme.colors.textSecondary};
  }
`;

export const CompanyPickerList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
`;

export const CompanyPickerItem = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.9rem;
  padding: 0.9rem 1rem;
  border-radius: 0.8rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.inputBackground};
  color: ${({ theme }) => theme.colors.text};
  font-family: ${({ theme }) => theme.fonts.main};
  cursor: pointer;
  text-align: left;
  transition: border-color 0.18s ease, background-color 0.18s ease;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    background: ${({ theme }) => theme.colors.surfaceAlt};
  }
`;

export const CompanyPickerName = styled.span`
  font-size: 0.95rem;
  font-weight: 700;
  flex: 1;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const CompanyPickerRole = styled.span`
  font-size: 0.78rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  flex-shrink: 0;
  text-transform: capitalize;
`;
