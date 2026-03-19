import styled from 'styled-components';

export const Wrapper = styled.div`
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
