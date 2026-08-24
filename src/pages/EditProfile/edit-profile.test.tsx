import { HttpResponse, http } from 'msw';
import { describe, expect, it } from 'vitest';
import { renderWithProviders, screen, userEvent, waitFor } from '../../test/test-utils';
import { ACCESS_TOKEN, api } from '../../test/msw/handlers';
import { server } from '../../test/msw/server';
import { buildUser } from '../../test/factories';
import type { IUserResponse } from '../../services/datalab-api/usersResource';
import { EditProfile } from './edit-profile';

type User = ReturnType<typeof userEvent.setup>;

const givenLoggedUser = (me: Partial<IUserResponse> = {}) => {
  localStorage.setItem('accessToken', ACCESS_TOKEN);
  server.use(http.get(api('users/me'), () => HttpResponse.json(buildUser(me))));
};

const captureUpdate = () => {
  const captured: { body?: unknown } = {};
  server.use(
    http.patch(api('users/me'), async ({ request }) => {
      captured.body = await request.json();
      return HttpResponse.json(buildUser());
    }),
  );
  return captured;
};

const save = (user: User) => user.click(screen.getByRole('button', { name: 'Salvar alterações' }));

describe('<EditProfile />', () => {
  it('renders nothing until the user is loaded', () => {
    renderWithProviders(<EditProfile />);

    expect(screen.queryByText('Editar perfil')).not.toBeInTheDocument();
  });

  it('pre-fills the form with the current profile', async () => {
    givenLoggedUser({ name: 'Ana Souza', config: { theme: 'dark' } });
    renderWithProviders(<EditProfile />);

    expect(await screen.findByLabelText('Nome')).toHaveValue('Ana Souza');
    expect(screen.getByLabelText('Tema')).toHaveValue('dark');
  });

  it('falls back to the system theme when the user has no preference', async () => {
    givenLoggedUser({ config: null });
    renderWithProviders(<EditProfile />);

    expect(await screen.findByLabelText('Tema')).toHaveValue('system');
  });

  it('saves name, phone and theme', async () => {
    const user = userEvent.setup({ delay: null });
    givenLoggedUser({ name: 'Ana Souza' });
    const captured = captureUpdate();
    renderWithProviders(<EditProfile />);

    const name = await screen.findByLabelText('Nome');
    await user.clear(name);
    await user.type(name, 'Ana Maria Souza');
    await user.selectOptions(screen.getByLabelText('Tema'), 'dark');
    await save(user);

    expect(await screen.findByText('Perfil atualizado com sucesso!')).toBeInTheDocument();
    expect(captured.body).toMatchObject({
      name: 'Ana Maria Souza',
      config: { theme: 'dark' },
    });
  });

  it('omits the password when the fields are left empty', async () => {
    const user = userEvent.setup({ delay: null });
    givenLoggedUser();
    const captured = captureUpdate();
    renderWithProviders(<EditProfile />);

    await screen.findByLabelText('Nome');
    await save(user);

    await waitFor(() => expect(captured.body).toBeDefined());
    expect(captured.body).not.toHaveProperty('password');
  });

  it('sends the new password when both fields match', async () => {
    const user = userEvent.setup({ delay: null });
    givenLoggedUser();
    const captured = captureUpdate();
    renderWithProviders(<EditProfile />);

    await user.type(await screen.findByLabelText('Nova senha'), 'NovaSenha@123');
    await user.type(screen.getByLabelText('Confirmar nova senha'), 'NovaSenha@123');
    await save(user);

    await waitFor(() => expect(captured.body).toMatchObject({ password: 'NovaSenha@123' }));
  });

  it('refuses a new password that fails the strength rules', async () => {
    const user = userEvent.setup({ delay: null });
    givenLoggedUser();
    const captured = captureUpdate();
    renderWithProviders(<EditProfile />);

    await user.type(await screen.findByLabelText('Nova senha'), 'fraca');
    await user.type(screen.getByLabelText('Confirmar nova senha'), 'fraca');
    await save(user);

    expect(await screen.findByText(/no minimo 8 caracteres/i)).toBeInTheDocument();
    expect(captured.body).toBeUndefined();
  });

  it('shows the backend failure inline', async () => {
    const user = userEvent.setup({ delay: null });
    givenLoggedUser();
    server.use(
      http.patch(api('users/me'), () =>
        HttpResponse.json({ detail: 'Telefone já cadastrado.' }, { status: 400 }),
      ),
    );
    renderWithProviders(<EditProfile />);

    await screen.findByLabelText('Nome');
    await save(user);

    expect(await screen.findByText(/Telefone já cadastrado\./)).toBeInTheDocument();
  });
});
