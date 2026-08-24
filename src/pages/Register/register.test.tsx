import { HttpResponse, http } from 'msw';
import { describe, expect, it } from 'vitest';
import { Route, Routes } from 'react-router-dom';
import { renderWithProviders, screen, userEvent, waitFor } from '../../test/test-utils';
import { api } from '../../test/msw/handlers';
import { server } from '../../test/msw/server';
import { buildUser, uuid } from '../../test/factories';
import { Register } from './register';

type User = ReturnType<typeof userEvent.setup>;

const setupUser = (): User => userEvent.setup({ delay: null });

const renderRegister = (route = '/cadastro') =>
  renderWithProviders(
    <Routes>
      <Route path="/cadastro" element={<Register />} />
      <Route path="/login" element={<h1>Login</h1>} />
    </Routes>,
    { route },
  );

const fillRegisterForm = async (user: User, { password = 'Senha@123' } = {}) => {
  await user.type(screen.getByLabelText('Nome Completo'), 'Ana Souza');
  await user.type(screen.getByLabelText('Email'), 'ana@datalab.com');
  await user.type(screen.getByLabelText('Telefone'), '41999');
  await user.type(screen.getByLabelText('Senha'), password);
  await user.type(screen.getByLabelText('Confirmar Senha'), password);
};

const submitRegister = (user: User) =>
  user.click(screen.getByRole('button', { name: 'Cadastrar' }));

const advanceToConfirmationStep = async (user: User) => {
  await fillRegisterForm(user);
  await submitRegister(user);
  await screen.findByLabelText('Código de Confirmação');
};

describe('<Register />', () => {
  it('creates the account and moves on to the confirmation step', async () => {
    const user = setupUser();
    renderRegister();

    await fillRegisterForm(user);
    await submitRegister(user);

    expect(await screen.findByLabelText('Código de Confirmação')).toBeInTheDocument();
    expect(screen.getByText('ana@datalab.com')).toBeInTheDocument();
  });

  it('sends name, email, phone and password to the backend', async () => {
    const user = setupUser();
    let body: unknown;
    server.use(
      http.post(api('users'), async ({ request }) => {
        body = await request.json();
        return HttpResponse.json(buildUser(), { status: 201 });
      }),
    );
    renderRegister();

    await fillRegisterForm(user);
    await submitRegister(user);

    await waitFor(() =>
      expect(body).toEqual({
        name: 'Ana Souza',
        email: 'ana@datalab.com',
        phone_number: '+5541999',
        password: 'Senha@123',
      }),
    );
  });

  it('pre-fills the email coming from the invite link', () => {
    renderRegister('/cadastro?email=convidado@acme.com');

    expect(screen.getByLabelText('Email')).toHaveValue('convidado@acme.com');
  });

  it('blocks a weak password before reaching the backend', async () => {
    const user = setupUser();
    let called = false;
    server.use(
      http.post(api('users'), () => {
        called = true;
        return HttpResponse.json(buildUser(), { status: 201 });
      }),
    );
    renderRegister();

    await fillRegisterForm(user, { password: 'fraca' });
    await submitRegister(user);

    expect(await screen.findByText(/no minimo 8 caracteres/i)).toBeInTheDocument();
    expect(called).toBe(false);
    expect(screen.queryByLabelText('Código de Confirmação')).not.toBeInTheDocument();
  });

  it('keeps the user on the form when the backend rejects the e-mail', async () => {
    const user = setupUser();
    server.use(
      http.post(api('users'), () =>
        HttpResponse.json({ detail: 'E-mail já cadastrado.' }, { status: 409 }),
      ),
    );
    renderRegister();

    await fillRegisterForm(user);
    await submitRegister(user);

    expect(await screen.findByText(/E-mail já cadastrado\./)).toBeInTheDocument();
    expect(screen.queryByLabelText('Código de Confirmação')).not.toBeInTheDocument();
  });

  it('confirms the account and redirects to login', async () => {
    const user = setupUser();
    let confirmedWith: unknown;
    server.use(
      http.post(api(`users/${uuid(3)}/confirm-account`), async ({ request }) => {
        confirmedWith = await request.json();
        return HttpResponse.json(buildUser());
      }),
    );
    renderRegister();
    await advanceToConfirmationStep(user);

    await user.type(screen.getByLabelText('Código de Confirmação'), '123456');
    await user.click(screen.getByRole('button', { name: 'Confirmar Conta' }));

    expect(await screen.findByRole('heading', { name: 'Login' })).toBeInTheDocument();
    expect(confirmedWith).toEqual({ code: '123456' });
  });

  it('rejects a confirmation code that is not six digits', async () => {
    const user = setupUser();
    renderRegister();
    await advanceToConfirmationStep(user);

    await user.type(screen.getByLabelText('Código de Confirmação'), '12ab');
    await user.click(screen.getByRole('button', { name: 'Confirmar Conta' }));

    expect(await screen.findByText(/exatamente 6 caracteres/i)).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Login' })).not.toBeInTheDocument();
  });

  it('resends the confirmation code and starts the cooldown', async () => {
    const user = setupUser();
    renderRegister();
    await advanceToConfirmationStep(user);

    await user.click(screen.getByRole('button', { name: 'Reenviar Código' }));

    expect(await screen.findByText(/Novo código enviado para ana@datalab\.com/)).toBeInTheDocument();
    await waitFor(() => expect(screen.getByRole('button', { name: /Reenviar em/ })).toBeDisabled());
  });

  it('reports a failure when the resend request breaks', async () => {
    const user = setupUser();
    server.use(
      http.post(api(`users/${uuid(3)}/resend-confirmation`), () =>
        HttpResponse.json({ detail: 'Limite excedido.' }, { status: 429 }),
      ),
    );
    renderRegister();
    await advanceToConfirmationStep(user);

    await user.click(screen.getByRole('button', { name: 'Reenviar Código' }));

    expect(await screen.findByText(/Falha ao reenviar código/i)).toBeInTheDocument();
  });
});
