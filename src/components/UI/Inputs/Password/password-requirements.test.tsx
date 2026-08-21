import { describe, expect, it } from 'vitest';
import { renderWithProviders, screen } from '../../../../test/test-utils';
import { lightTheme } from '../../../../styles/themes';
import { PasswordRequirements } from './password-requirements';

describe('<PasswordRequirements />', () => {
  it('lista as quatro regras de senha', () => {
    renderWithProviders(<PasswordRequirements password="" />);

    expect(screen.getAllByRole('listitem')).toHaveLength(4);
  });

  it('anuncia mudanças para leitores de tela', () => {
    renderWithProviders(<PasswordRequirements password="" />);

    expect(screen.getByRole('list')).toHaveAttribute('aria-live', 'polite');
  });

  it('destaca em verde apenas as regras já atendidas', () => {
    renderWithProviders(<PasswordRequirements password="senha@123" />);

    expect(screen.getByText(/no minimo 8 caracteres/i)).toHaveStyle({ color: lightTheme.colors.success });
    expect(screen.getByText(/letra maiuscula/i)).toHaveStyle({
      color: lightTheme.colors.textSecondary,
    });
  });

  it('destaca todas as regras quando a senha é válida', () => {
    renderWithProviders(<PasswordRequirements password="Senha@123" />);

    screen.getAllByRole('listitem').forEach((item) => {
      expect(item).toHaveStyle({ color: lightTheme.colors.success });
    });
  });
});
