import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders, screen, userEvent } from '../../../../test/test-utils';
import { PasswordInput } from './password-input';

const renderInput = (props: Partial<React.ComponentProps<typeof PasswordInput>> = {}) =>
  renderWithProviders(<PasswordInput aria-label="Senha" {...props} />);

describe('<PasswordInput />', () => {
  it('esconde o valor por padrão e revela ao clicar no olho', async () => {
    const user = userEvent.setup();
    renderInput();

    const input = screen.getByLabelText('Senha');
    expect(input).toHaveAttribute('type', 'password');

    await user.click(screen.getByRole('button', { name: 'Mostrar senha' }));
    expect(input).toHaveAttribute('type', 'text');

    await user.click(screen.getByRole('button', { name: 'Ocultar senha' }));
    expect(input).toHaveAttribute('type', 'password');
  });

  it('repassa o onChange do consumidor', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderInput({ onChange });

    await user.type(screen.getByLabelText('Senha'), 'abc');

    expect(onChange).toHaveBeenCalledTimes(3);
  });

  it('mostra os requisitos só depois do foco, quando habilitado', async () => {
    const user = userEvent.setup();
    renderInput({ showRequirements: true });

    expect(screen.queryByRole('list')).not.toBeInTheDocument();

    await user.click(screen.getByLabelText('Senha'));
    expect(screen.getByRole('list')).toBeInTheDocument();

    await user.tab();
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });

  it('acusa divergência entre senha e confirmação', async () => {
    const user = userEvent.setup();
    renderInput({ matchValue: 'Senha@123' });

    await user.type(screen.getByLabelText('Senha'), 'Senha@12');
    expect(screen.getByText('As senhas não coincidem.')).toBeInTheDocument();

    await user.type(screen.getByLabelText('Senha'), '3');
    expect(screen.queryByText('As senhas não coincidem.')).not.toBeInTheDocument();
  });

  it('bloqueia o submit do form enquanto as senhas divergem', async () => {
    const user = userEvent.setup();
    renderInput({ matchValue: 'Senha@123' });

    const input = screen.getByLabelText('Senha') as HTMLInputElement;
    await user.type(input, 'outra');

    expect(input.checkValidity()).toBe(false);
    expect(input.validationMessage).toBe('As senhas não coincidem.');
  });

  it('não valida divergência quando enableMatchValidation é false', async () => {
    const user = userEvent.setup();
    renderInput({ matchValue: 'Senha@123', enableMatchValidation: false });

    await user.type(screen.getByLabelText('Senha'), 'outra');

    expect(screen.queryByText('As senhas não coincidem.')).not.toBeInTheDocument();
  });
});
