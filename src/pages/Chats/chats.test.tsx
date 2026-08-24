import { HttpResponse, http } from 'msw';
import { describe, expect, it } from 'vitest';
import { Route, Routes } from 'react-router-dom';
import { renderWithProviders, screen, userEvent, waitFor } from '../../test/test-utils';
import { api } from '../../test/msw/handlers';
import { server } from '../../test/msw/server';
import { buildChat, buildCompany, uuid } from '../../test/factories';
import type { IRetrieveChat } from '../../services/datalab-api/chatsResource';
import { Chats } from './chats';

const company = buildCompany({ id: uuid(1) });

const givenChats = (chats: IRetrieveChat[]) => {
  server.use(http.get(api('chats/'), () => HttpResponse.json(chats)));
};

const renderChats = () =>
  renderWithProviders(
    <Routes>
      <Route path="/ia/conversas" element={<Chats />} />
      <Route path="/ia/conversas/:chatId/mensagens" element={<h1>Mensagens</h1>} />
    </Routes>,
    { route: '/ia/conversas', companies: [company] },
  );

const openCreateModal = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.click(await screen.findByRole('button', { name: /Criar nova conversa/ }));
  return screen.findByRole('dialog');
};

describe('<Chats />', () => {
  it('lists the existing conversations with a link to their messages', async () => {
    givenChats([buildChat({ id: uuid(20), title: 'Análise de vendas' })]);
    renderChats();

    const link = await screen.findByRole('link', { name: 'Análise de vendas' });
    expect(link).toHaveAttribute('href', `/ia/conversas/${uuid(20)}/mensagens`);
  });

  it('shows an empty state when there is no conversation yet', async () => {
    renderChats();

    expect(await screen.findByText('Nenhum chat encontrado.')).toBeInTheDocument();
  });

  it('creates a conversation and opens it', async () => {
    const user = userEvent.setup({ delay: null });
    let body: unknown;
    server.use(
      http.post(api('chats/'), async ({ request }) => {
        body = await request.json();
        return HttpResponse.json(buildChat({ id: uuid(21), title: 'Campanhas Q3' }), { status: 201 });
      }),
    );
    renderChats();
    await openCreateModal(user);

    await user.type(screen.getByLabelText('Título da Conversa'), 'Campanhas Q3');
    await user.click(screen.getByRole('button', { name: 'Criar' }));

    expect(await screen.findByRole('heading', { name: 'Mensagens' })).toBeInTheDocument();
    expect(body).toEqual({ title: 'Campanhas Q3' });
  });

  it('keeps the modal open and reports the failure', async () => {
    const user = userEvent.setup({ delay: null });
    server.use(
      http.post(api('chats/'), () =>
        HttpResponse.json({ detail: 'Limite de conversas atingido.' }, { status: 402 }),
      ),
    );
    renderChats();
    await openCreateModal(user);

    await user.type(screen.getByLabelText('Título da Conversa'), 'Campanhas Q3');
    await user.click(screen.getByRole('button', { name: 'Criar' }));

    expect(await screen.findByText(/Limite de conversas atingido\./)).toBeInTheDocument();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Mensagens' })).not.toBeInTheDocument();
  });

  it('closes the modal without creating anything', async () => {
    const user = userEvent.setup();
    renderChats();
    await openCreateModal(user);

    await user.click(screen.getByRole('button', { name: 'Fechar modal' }));

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });
});
