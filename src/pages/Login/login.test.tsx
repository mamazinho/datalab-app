import { HttpResponse, http } from 'msw';
import { describe, expect, it, vi } from 'vitest';
import { Route, Routes } from 'react-router-dom';
import { renderWithProviders, screen, userEvent, waitFor } from '../../test/test-utils';
import { ACCESS_TOKEN, api, apiErrorResponse } from '../../test/msw/handlers';
import { server } from '../../test/msw/server';
import { buildApiError } from '../../test/factories';
import { Login } from './login';

const renderLogin = () =>
  renderWithProviders(
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<h1>Home</h1>} />
    </Routes>,
    { route: '/login' },
  );

const fillCredentials = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.type(screen.getByLabelText('Email'), 'ana@datalab.com');
  await user.type(screen.getByLabelText('Senha'), 'Senha@123');
};

const submit = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.click(screen.getByRole('button', { name: /^entrar$/i }));
};

describe('<Login />', () => {
  it('authenticates, stores the token and redirects to home', async () => {
    const user = userEvent.setup();
    renderLogin();

    await fillCredentials(user);
    await submit(user);

    expect(await screen.findByRole('heading', { name: 'Home' })).toBeInTheDocument();
    expect(localStorage.getItem('accessToken')).toBe(ACCESS_TOKEN);
  });

  it('sends the typed credentials to the backend', async () => {
    const user = userEvent.setup();
    let body: unknown;
    server.use(
      http.post(api('auth/login/'), async ({ request }) => {
        body = await request.json();
        return HttpResponse.json({ access_token: ACCESS_TOKEN, token_type: 'bearer', expires_in: 3600, scope: '' });
      }),
    );
    renderLogin();

    await fillCredentials(user);
    await submit(user);

    await waitFor(() => expect(body).toEqual({ email: 'ana@datalab.com', password: 'Senha@123' }));
  });

  it('shows the backend message and stays on the page when credentials are wrong', async () => {
    const user = userEvent.setup();
    server.use(
      http.post(api('auth/login/'), () =>
        apiErrorResponse(401, 'E-mail ou senha inválidos.'),
      ),
    );
    renderLogin();

    await fillCredentials(user);
    await submit(user);

    expect(await screen.findByText(/E-mail ou senha inválidos\./)).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Home' })).not.toBeInTheDocument();
    expect(localStorage.getItem('accessToken')).toBeNull();
  });

  it('shows the support code of the failed request discreetly in the toast', async () => {
    const user = userEvent.setup();
    server.use(
      http.post(api('auth/login/'), () =>
        HttpResponse.json(buildApiError({ status: 500, friendly_message: 'Algo deu errado do nosso lado.' }), {
          status: 500,
          headers: { traceresponse: '00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01' },
        }),
      ),
    );
    renderLogin();

    await fillCredentials(user);
    await submit(user);

    await user.click(await screen.findByText(/Algo deu errado do nosso lado\./));

    expect(screen.getByText('4bf92f3577b34da6a3ce929d0e0e4736')).toBeInTheDocument();
  });

  it('reports a network failure without leaving the page', async () => {
    const user = userEvent.setup();
    server.use(http.post(api('auth/login/'), () => HttpResponse.error()));
    renderLogin();

    await fillCredentials(user);
    await submit(user);

    expect(await screen.findByText(/Verifique sua internet/)).toBeInTheDocument();
  });

  it('locks the form while the request is in flight', async () => {
    const user = userEvent.setup();
    let releaseResponse!: () => void;
    const pending = new Promise<void>((resolve) => {
      releaseResponse = resolve;
    });
    server.use(
      http.post(api('auth/login/'), async () => {
        await pending;
        return HttpResponse.json({ access_token: ACCESS_TOKEN, token_type: 'bearer', expires_in: 3600, scope: '' });
      }),
    );
    renderLogin();

    await fillCredentials(user);
    await submit(user);

    expect(await screen.findByRole('button', { name: 'Entrando...' })).toBeDisabled();

    releaseResponse();

    expect(await screen.findByRole('heading', { name: 'Home' })).toBeInTheDocument();
  });

  it('opens the provider window on social login', async () => {
    const user = userEvent.setup();
    const open = vi.spyOn(window, 'open').mockReturnValue(null);
    renderLogin();

    await user.click(screen.getByRole('button', { name: /google/i }));

    expect(open).toHaveBeenCalledWith(
      expect.stringContaining('/auth/google/login/'),
      'google_login_popup',
      expect.any(String),
    );
  });

  it('offers the way out to register and password recovery', () => {
    renderLogin();

    expect(screen.getByRole('link', { name: /cadastre-se/i })).toHaveAttribute('href', '/cadastro');
    expect(screen.getByRole('link', { name: /esqueci minha senha/i })).toHaveAttribute(
      'href',
      '/esqueci-senha',
    );
  });
});
