import styled from 'styled-components';

export const EditProfileShell = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
`;

export const EditProfileContainer = styled.section`
  width: min(100%, 44rem);
  margin: 0.5rem 0 1.5rem;
  border-radius: 1rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  box-shadow: 0 12px 22px ${({ theme }) => theme.colors.shadow};
  padding: 1.5rem;
`;

export const EditProfileTitle = styled.h1`
  margin: 0 0 0.45rem;
  font-size: 1.45rem;
  color: ${({ theme }) => theme.colors.text};
`;

export const EditProfileSubtitle = styled.p`
  margin: 0 0 1.2rem;
  color: ${({ theme }) => theme.colors.textSecondary};
`;


export const DangerZone = styled.section`
  margin-top: 2rem;
  padding-top: 1.25rem;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`;

export const DangerTitle = styled.h2`
  margin: 0 0 0.35rem;
  font-size: 1.05rem;
  color: ${({ theme }) => theme.colors.error};
`;

export const DangerText = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 0.88rem;
`;

export const DangerButton = styled.button`
  margin-top: 0.9rem;
  padding: 0.6rem 1.1rem;
  border-radius: 0.65rem;
  border: 1px solid ${({ theme }) => theme.colors.error};
  background: transparent;
  color: ${({ theme }) => theme.colors.error};
  font-weight: 700;
  font-family: ${({ theme }) => theme.fonts.main};
  cursor: pointer;
  transition: background 0.16s ease, color 0.16s ease;

  &:hover:enabled {
    background: ${({ theme }) => theme.colors.error};
    color: #fff;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const DeleteAccountForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

export const CompanyList = styled.ul`
  margin: 0.5rem 0 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 0.35rem;
  color: ${({ theme }) => theme.colors.text};
  font-size: 0.9rem;

  li {
    display: flex;
    align-items: center;
    gap: 0.45rem;
  }
`;

export const DeleteAccountSubmit = styled(DangerButton)`
  margin-top: 0;
  align-self: flex-end;
  background: ${({ theme }) => theme.colors.error};
  color: #fff;
`;
