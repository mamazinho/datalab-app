import { describe, expect, it } from 'vitest';
import { renderWithProviders, screen } from '../../../../test/test-utils';
import { lightTheme } from '../../../../styles/themes';
import { PasswordRequirements } from './password-requirements';

describe('<PasswordRequirements />', () => {
  it('lists the four password rules', () => {
    renderWithProviders(<PasswordRequirements password="" />);

    expect(screen.getAllByRole('listitem')).toHaveLength(4);
  });

  it('announces changes to screen readers', () => {
    renderWithProviders(<PasswordRequirements password="" />);

    expect(screen.getByRole('list')).toHaveAttribute('aria-live', 'polite');
  });

  it('highlights only the rules already satisfied', () => {
    renderWithProviders(<PasswordRequirements password="senha@123" />);

    expect(screen.getByText(/no minimo 8 caracteres/i)).toHaveStyle({ color: lightTheme.colors.success });
    expect(screen.getByText(/letra maiuscula/i)).toHaveStyle({
      color: lightTheme.colors.textSecondary,
    });
  });

  it('highlights every rule once the password is valid', () => {
    renderWithProviders(<PasswordRequirements password="Senha@123" />);

    screen.getAllByRole('listitem').forEach((item) => {
      expect(item).toHaveStyle({ color: lightTheme.colors.success });
    });
  });
});
