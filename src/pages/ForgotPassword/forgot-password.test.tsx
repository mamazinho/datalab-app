import { HttpResponse, http } from 'msw';
import { describe, expect, it } from 'vitest';
import { renderWithProviders, screen, userEvent, waitFor } from '../../test/test-utils';
import { api } from '../../test/msw/handlers';
import { server } from '../../test/msw/server';
import { ForgotPassword } from './forgot-password';

describe('<ForgotPassword />', () => {
  it('sends the recovery link and confirms it on screen', async () => {
    const user = userEvent.setup();
    let body: unknown;
    server.use(
      http.post(api('users/forgot-password'), async ({ request }) => {
        body = await request.json();
        return new HttpResponse(null, { status: 204 });
      }),
    );
    renderWithProviders(<ForgotPassword />);

    await user.type(screen.getByLabelText('Email'), 'ana@datalab.com');
    await user.click(screen.getByRole('button', { name: 'Enviar Link' }));

    expect(await screen.findByText(/link de recuperação foi enviado/i)).toBeInTheDocument();
    expect(body).toEqual({ user_email: 'ana@datalab.com' });
  });

  it('blocks resending until the cooldown is over', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ForgotPassword />);

    await user.type(screen.getByLabelText('Email'), 'ana@datalab.com');
    await user.click(screen.getByRole('button', { name: 'Enviar Link' }));

    await waitFor(() => expect(screen.getByRole('button', { name: /Reenviar em/ })).toBeDisabled());
  });

  it('reports the backend failure', async () => {
    const user = userEvent.setup();
    server.use(
      http.post(api('users/forgot-password'), () =>
        HttpResponse.json({ detail: 'Usuário não encontrado.' }, { status: 404 }),
      ),
    );
    renderWithProviders(<ForgotPassword />);

    await user.type(screen.getByLabelText('Email'), 'ninguem@datalab.com');
    await user.click(screen.getByRole('button', { name: 'Enviar Link' }));

    expect(await screen.findByText(/Usuário não encontrado\./)).toBeInTheDocument();
  });

  it('offers the way back to login', () => {
    renderWithProviders(<ForgotPassword />);

    expect(screen.getByRole('link', { name: 'Voltar para Login' })).toHaveAttribute('href', '/login');
  });
});
