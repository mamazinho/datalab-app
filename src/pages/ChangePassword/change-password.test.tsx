import { HttpResponse, http } from 'msw';
import { describe, expect, it, vi } from 'vitest';
import { Route, Routes } from 'react-router-dom';
import { renderWithProviders, screen, userEvent, waitFor } from '../../test/test-utils';
import { api } from '../../test/msw/handlers';
import { server } from '../../test/msw/server';
import { buildUser } from '../../test/factories';
import { ChangePassword } from './change-password';

type User = ReturnType<typeof userEvent.setup>;

const RESET_LINK = '/redefinir-senha?email=ana@datalab.com&code=123456';

const renderChangePassword = (route = RESET_LINK) =>
  renderWithProviders(
    <Routes>
      <Route path="/redefinir-senha" element={<ChangePassword />} />
      <Route path="/login" element={<h1>Login</h1>} />
    </Routes>,
    { route },
  );

const fillNewPassword = async (user: User, password = 'NovaSenha@123') => {
  await user.type(screen.getByLabelText('Nova Senha'), password);
  await user.type(screen.getByLabelText('Confirmar Senha'), password);
};

const submit = (user: User) => user.click(screen.getByRole('button', { name: 'Alterar Senha' }));

describe('<ChangePassword />', () => {
  it('sends the new password with the e-mail and code from the link', async () => {
    const user = userEvent.setup({ delay: null });
    let body: unknown;
    server.use(
      http.post(api('users/change-password'), async ({ request }) => {
        body = await request.json();
        return HttpResponse.json(buildUser());
      }),
    );
    renderChangePassword();

    await fillNewPassword(user);
    await submit(user);

    expect(await screen.findByText('Senha alterada com sucesso!')).toBeInTheDocument();
    expect(body).toEqual({
      user_email: 'ana@datalab.com',
      code: '123456',
      new_password: 'NovaSenha@123',
    });
  });

  it('redirects to login after the success message', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderChangePassword();

    await fillNewPassword(user);
    await submit(user);
    await screen.findByText('Senha alterada com sucesso!');

    await vi.advanceTimersByTimeAsync(3000);

    expect(await screen.findByRole('heading', { name: 'Login' })).toBeInTheDocument();
    vi.useRealTimers();
  });

  it('shows an expired-link message inline, without a toast', async () => {
    const user = userEvent.setup({ delay: null });
    server.use(
      http.post(api('users/change-password'), () =>
        HttpResponse.json({ detail: 'Código expirado.' }, { status: 400 }),
      ),
    );
    renderChangePassword();

    await fillNewPassword(user);
    await submit(user);

    expect(await screen.findByText(/O link pode ter expirado\./)).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Login' })).not.toBeInTheDocument();
  });

  it('rejects a password that fails the strength rules', async () => {
    const user = userEvent.setup({ delay: null });
    let called = false;
    server.use(
      http.post(api('users/change-password'), () => {
        called = true;
        return HttpResponse.json(buildUser());
      }),
    );
    renderChangePassword();

    await fillNewPassword(user, 'fraca');
    await submit(user);

    expect(await screen.findByText(/no minimo 8 caracteres/i)).toBeInTheDocument();
    expect(called).toBe(false);
  });

  it('rejects a reset link without e-mail and code', async () => {
    const user = userEvent.setup({ delay: null });
    let called = false;
    server.use(
      http.post(api('users/change-password'), () => {
        called = true;
        return HttpResponse.json(buildUser());
      }),
    );
    renderChangePassword('/redefinir-senha');

    await fillNewPassword(user);
    await submit(user);

    await waitFor(() => expect(called).toBe(false));
    expect(screen.queryByRole('heading', { name: 'Login' })).not.toBeInTheDocument();
  });
});
