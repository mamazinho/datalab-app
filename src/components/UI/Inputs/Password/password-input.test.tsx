import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders, screen, userEvent } from '../../../../test/test-utils';
import { PasswordInput } from './password-input';

const renderInput = (props: Partial<React.ComponentProps<typeof PasswordInput>> = {}) =>
  renderWithProviders(<PasswordInput aria-label="Senha" {...props} />);

describe('<PasswordInput />', () => {
  it('hides the value by default and reveals it on the eye button', async () => {
    const user = userEvent.setup();
    renderInput();

    const input = screen.getByLabelText('Senha');
    expect(input).toHaveAttribute('type', 'password');

    await user.click(screen.getByRole('button', { name: 'Mostrar senha' }));
    expect(input).toHaveAttribute('type', 'text');

    await user.click(screen.getByRole('button', { name: 'Ocultar senha' }));
    expect(input).toHaveAttribute('type', 'password');
  });

  it('forwards the consumer onChange', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderInput({ onChange });

    await user.type(screen.getByLabelText('Senha'), 'abc');

    expect(onChange).toHaveBeenCalledTimes(3);
  });

  it('shows the requirements only after focus, when enabled', async () => {
    const user = userEvent.setup();
    renderInput({ showRequirements: true });

    expect(screen.queryByRole('list')).not.toBeInTheDocument();

    await user.click(screen.getByLabelText('Senha'));
    expect(screen.getByRole('list')).toBeInTheDocument();

    await user.tab();
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });

  it('flags a mismatch between password and confirmation', async () => {
    const user = userEvent.setup();
    renderInput({ matchValue: 'Senha@123' });

    await user.type(screen.getByLabelText('Senha'), 'Senha@12');
    expect(screen.getByText('As senhas não coincidem.')).toBeInTheDocument();

    await user.type(screen.getByLabelText('Senha'), '3');
    expect(screen.queryByText('As senhas não coincidem.')).not.toBeInTheDocument();
  });

  it('blocks the form submit while the passwords differ', async () => {
    const user = userEvent.setup();
    renderInput({ matchValue: 'Senha@123' });

    const input = screen.getByLabelText('Senha') as HTMLInputElement;
    await user.type(input, 'outra');

    expect(input.checkValidity()).toBe(false);
    expect(input.validationMessage).toBe('As senhas não coincidem.');
  });

  it('skips the mismatch check when enableMatchValidation is false', async () => {
    const user = userEvent.setup();
    renderInput({ matchValue: 'Senha@123', enableMatchValidation: false });

    await user.type(screen.getByLabelText('Senha'), 'outra');

    expect(screen.queryByText('As senhas não coincidem.')).not.toBeInTheDocument();
  });
});
