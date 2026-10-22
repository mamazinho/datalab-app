import { describe, expect, it } from 'vitest';
import { renderWithProviders, screen, userEvent } from '../../../test/test-utils';
import { Collapsible } from './collapsible';

const renderInForm = ({ defaultOpen = false, avatar = 'https://cdn.datalab.com/a.png' } = {}) =>
  renderWithProviders(
    <form aria-label="Agente">
      <Collapsible label="Mais opções" defaultOpen={defaultOpen}>
        <label htmlFor="avatar">Avatar</label>
        <input id="avatar" name="avatar" type="url" defaultValue={avatar} />
      </Collapsible>
      <button type="submit">Salvar</button>
    </form>,
  );

describe('<Collapsible />', () => {
  it('hides the content until the trigger is clicked', async () => {
    const user = userEvent.setup();
    renderInForm();
    const trigger = screen.getByRole('button', { name: 'Mais opções' });

    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('textbox', { name: 'Avatar' })).not.toBeInTheDocument();

    await user.click(trigger);

    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('textbox', { name: 'Avatar' })).toBeVisible();

    await user.click(trigger);

    expect(screen.queryByRole('textbox', { name: 'Avatar' })).not.toBeInTheDocument();
  });

  it('starts open when asked to', () => {
    renderInForm({ defaultOpen: true });

    expect(screen.getByRole('button', { name: 'Mais opções' })).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('textbox', { name: 'Avatar' })).toBeVisible();
  });

  it('keeps the collapsed fields in the form data', () => {
    renderInForm();

    const form = screen.getByRole('form', { name: 'Agente' }) as HTMLFormElement;

    expect(new FormData(form).get('avatar')).toBe('https://cdn.datalab.com/a.png');
  });

  it('opens itself when a field inside is invalid on submit', async () => {
    const user = userEvent.setup();
    renderInForm({ avatar: 'nao-e-url' });

    await user.click(screen.getByRole('button', { name: 'Salvar' }));

    expect(screen.getByRole('button', { name: 'Mais opções' })).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('textbox', { name: 'Avatar' })).toBeInvalid();
  });
});
