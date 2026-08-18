import styled from 'styled-components';

/**
 * A lib é temada por CSS variables — nada de sobrescrever classe por classe.
 * Os valores espelham o `inputBaseStyles` do design-system para o campo de
 * telefone ficar do mesmo tamanho e com a mesma borda dos demais inputs.
 */
export const Wrapper = styled.div`
  --react-international-phone-height: 3.05rem;
  --react-international-phone-font-size: 0.95rem;
  --react-international-phone-border-radius: 0.85rem;
  --react-international-phone-border-color: ${({ theme }) => theme.colors.border};
  --react-international-phone-background-color: ${({ theme }) => theme.colors.inputBackground};
  --react-international-phone-text-color: ${({ theme }) => theme.colors.text};
  --react-international-phone-disabled-background-color: ${({ theme }) => theme.colors.inputBackground};
  --react-international-phone-disabled-text-color: ${({ theme }) => theme.colors.textSecondary};

  --react-international-phone-country-selector-background-color: transparent;
  --react-international-phone-country-selector-background-color-hover: ${({ theme }) => theme.colors.surfaceAlt};
  --react-international-phone-country-selector-arrow-color: ${({ theme }) => theme.colors.textSecondary};
  --react-international-phone-disabled-country-selector-background-color: transparent;

  --react-international-phone-dial-code-preview-background-color: transparent;
  --react-international-phone-dial-code-preview-border-color: transparent;
  --react-international-phone-dial-code-preview-text-color: ${({ theme }) => theme.colors.text};
  --react-international-phone-dial-code-preview-font-size: 0.95rem;
  --react-international-phone-dial-code-preview-disabled-background-color: transparent;
  --react-international-phone-dial-code-preview-disabled-text-color: ${({ theme }) => theme.colors.textSecondary};

  --react-international-phone-dropdown-item-background-color: ${({ theme }) => theme.colors.surface};
  --react-international-phone-dropdown-item-text-color: ${({ theme }) => theme.colors.text};
  --react-international-phone-dropdown-item-dial-code-color: ${({ theme }) => theme.colors.textSecondary};
  --react-international-phone-selected-dropdown-item-background-color: ${({ theme }) => theme.colors.surfaceAlt};
  --react-international-phone-selected-dropdown-item-text-color: ${({ theme }) => theme.colors.text};
  --react-international-phone-selected-dropdown-item-dial-code-color: ${({ theme }) => theme.colors.textSecondary};
  --react-international-phone-dropdown-preferred-list-divider-color: ${({ theme }) => theme.colors.border};
  --react-international-phone-dropdown-shadow: 0 12px 24px ${({ theme }) => theme.colors.shadow};
  --react-international-phone-dropdown-item-height: 2.25rem;
  --react-international-phone-dropdown-item-font-size: 0.9rem;

  .react-international-phone-input-container {
    display: flex;
    align-items: stretch;
    border: 1px solid ${({ theme }) => theme.colors.border};
    border-radius: 0.85rem;
    background: ${({ theme }) => theme.colors.inputBackground};
    transition: border-color 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease;
  }

  .react-international-phone-input-container:focus-within {
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px rgba(255, 190, 0, 0.25);
    background: ${({ theme }) => theme.colors.surface};
  }

  /* Bandeira, código do país e número dividem a mesma caixa: as bordas
     internas da lib virariam linhas duplicadas dentro do campo. */
  .react-international-phone-country-selector-button,
  .react-international-phone-dial-code-preview,
  .react-international-phone-input {
    border: 0;
    background: transparent;
  }

  .react-international-phone-country-selector-button {
    border-radius: 0.85rem 0 0 0.85rem;
    padding-left: 0.55rem;
    gap: 0.25rem;
  }

  .react-international-phone-dial-code-preview {
    display: flex;
    align-items: center;
    padding: 0 0.15rem 0 0;
    margin: 0;
  }

  /* Separador único entre "bandeira +55" e o número */
  .react-international-phone-input {
    flex: 1;
    min-width: 0;
    padding-left: 0.7rem;
    margin-left: 0.35rem;
    border-left: 1px solid ${({ theme }) => theme.colors.border};
    border-radius: 0 0.85rem 0.85rem 0;
  }

  .react-international-phone-input::placeholder {
    color: ${({ theme }) => theme.colors.textSecondary};
    opacity: 0.8;
  }

  .react-international-phone-country-selector-dropdown {
    border: 1px solid ${({ theme }) => theme.colors.border};
    border-radius: 0.75rem;
    padding: 0.3rem;
    z-index: 20;
  }
`;
