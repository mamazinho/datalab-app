import { HttpResponse, http } from 'msw';
import { describe, expect, it, vi } from 'vitest';
import { Route, Routes } from 'react-router-dom';
import { renderWithProviders, screen, userEvent, waitFor, within } from '../../test/test-utils';
import { api } from '../../test/msw/handlers';
import { server } from '../../test/msw/server';
import { buildChat, buildCompany, buildCurrentMembership, buildRoutePermission, uuid } from '../../test/factories';
import type { IRetrieveChat } from '../../services/datalab-api/chatsResource';
import type { IRoutePermission, IUserCompany } from '../../services/datalab-api/usersResource';
import { Chats } from './chats';

const company = buildCompany({ id: uuid(1) });
const asMember: IUserCompany = {
  ...company,
  membership: { ...company.membership, membership_role: 'member' },
};
const archivePermission = buildRoutePermission({ tag: 'chat', method: 'PATCH', path: '/v1/chats/{chat_id}/' });
const deletePermission = buildRoutePermission({ tag: 'chat', method: 'DELETE', path: '/v1/chats/{chat_id}/' });

const givenChats = (chats: IRetrieveChat[]) => {
  server.use(http.get(api('chats/'), () => HttpResponse.json(chats)));
};

const givenMemberPermissions = (permissions: IRoutePermission[]) => {
  server.use(
    http.get(api('memberships/current/'), () =>
      HttpResponse.json(buildCurrentMembership({ membership_role: 'member', permissions })),
    ),
  );
};

const renderChats = (companies: IUserCompany[] = [company]) =>
  renderWithProviders(
    <Routes>
      <Route path="/ia/conversas" element={<Chats />} />
      <Route path="/ia/conversas/:chatId/mensagens" element={<h1>Mensagens</h1>} />
    </Routes>,
    { route: '/ia/conversas', companies },
  );

const openCreateModal = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.click(await screen.findByRole('button', { name: /Criar nova conversa/ }));
  return screen.findByRole('dialog');
};

describe('<Chats />', () => {
  it('lists the existing conversations with a link to their messages', async () => {
    givenChats([buildChat({ id: uuid(20), title: 'Análise de vendas' })]);
    renderChats();

    const link = await screen.findByRole('link', { name: /Análise de vendas/ });
    expect(link).toHaveAttribute('href', `/ia/conversas/${uuid(20)}/mensagens`);
  });

  it('shows an empty state when there is no conversation yet', async () => {
    renderChats();

    expect(await screen.findByText('Nenhum chat encontrado.')).toBeInTheDocument();
  });

  it('shows who created each conversation and whether it is private or archived', async () => {
    givenChats([
      buildChat({
        id: uuid(20),
        created_by: { name: 'Bruno Lima', avatar_url: null },
        is_private: true,
        archived: true,
      }),
    ]);
    renderChats();

    expect(await screen.findByText('Bruno Lima')).toBeInTheDocument();
    expect(screen.getByText('Privada')).toBeInTheDocument();
    expect(screen.getByText('Arquivada')).toBeInTheDocument();
  });

  it('asks for the archived conversations once the filter is on', async () => {
    const user = userEvent.setup();
    const archivedParams: (string | null)[] = [];
    server.use(
      http.get(api('chats/'), ({ request }) => {
        const archived = new URL(request.url).searchParams.get('archived');
        archivedParams.push(archived);
        return HttpResponse.json(archived ? [buildChat({ title: 'Campanha antiga', archived: true })] : []);
      }),
    );
    renderChats();
    await screen.findByText('Nenhum chat encontrado.');

    await user.click(screen.getByRole('switch', { name: 'Mostrar arquivadas' }));

    expect(await screen.findByRole('link', { name: /Campanha antiga/ })).toBeInTheDocument();
    expect(archivedParams).toEqual([null, 'true']);
  });

  it('creates a private conversation and opens it', async () => {
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
    expect(body).toEqual({ title: 'Campanhas Q3', is_private: true });
  });

  it('creates a company conversation when the privacy toggle is turned off', async () => {
    const user = userEvent.setup({ delay: null });
    let body: unknown;
    server.use(
      http.post(api('chats/'), async ({ request }) => {
        body = await request.json();
        return HttpResponse.json(buildChat({ id: uuid(21), is_private: false }), { status: 201 });
      }),
    );
    renderChats();
    await openCreateModal(user);

    await user.type(screen.getByLabelText('Título da Conversa'), 'Campanhas Q3');
    await user.click(screen.getByRole('switch', { name: 'Conversa privada' }));
    await user.click(screen.getByRole('button', { name: 'Criar' }));

    await waitFor(() => expect(body).toEqual({ title: 'Campanhas Q3', is_private: false }));
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

  describe('managing a conversation', () => {
    it('lets the owner archive and delete a conversation someone else created', async () => {
      givenChats([buildChat({ created_by_membership_id: uuid(99) })]);
      renderChats();

      expect(await screen.findByRole('button', { name: 'Arquivar' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Excluir' })).toBeInTheDocument();
    });

    it('lets a member manage only the conversations they created', async () => {
      givenMemberPermissions([archivePermission, deletePermission]);
      givenChats([
        buildChat({ id: uuid(20), created_by_membership_id: uuid(2) }),
        buildChat({ id: uuid(21), created_by_membership_id: uuid(99) }),
      ]);
      renderChats([asMember]);

      const [ownChat, someoneElsesChat] = await screen.findAllByRole('listitem');
      expect(await within(ownChat).findByRole('button', { name: 'Arquivar' })).toBeInTheDocument();
      expect(within(ownChat).getByRole('button', { name: 'Excluir' })).toBeInTheDocument();
      expect(within(someoneElsesChat).queryByRole('button', { name: 'Arquivar' })).not.toBeInTheDocument();
      expect(within(someoneElsesChat).queryByRole('button', { name: 'Excluir' })).not.toBeInTheDocument();
    });

    it('offers a member only the actions they have permission for', async () => {
      givenMemberPermissions([deletePermission]);
      givenChats([buildChat({ created_by_membership_id: uuid(2) })]);
      renderChats([asMember]);

      expect(await screen.findByRole('button', { name: 'Excluir' })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Arquivar' })).not.toBeInTheDocument();
    });

    it('archives a conversation and reloads the list', async () => {
      const user = userEvent.setup();
      let chats = [buildChat({ id: uuid(20) })];
      let body: unknown;
      server.use(
        http.get(api('chats/'), () => HttpResponse.json(chats)),
        http.patch(api(`chats/${uuid(20)}/`), async ({ request }) => {
          body = await request.json();
          chats = [];
          return HttpResponse.json(buildChat({ id: uuid(20), archived: true }));
        }),
      );
      renderChats();

      await user.click(await screen.findByRole('button', { name: 'Arquivar' }));

      expect(await screen.findByText('Nenhum chat encontrado.')).toBeInTheDocument();
      expect(body).toEqual({ archived: true });
    });

    it('unarchives an archived conversation', async () => {
      const user = userEvent.setup();
      let body: unknown;
      givenChats([buildChat({ id: uuid(20), archived: true })]);
      server.use(
        http.patch(api(`chats/${uuid(20)}/`), async ({ request }) => {
          body = await request.json();
          return HttpResponse.json(buildChat({ id: uuid(20) }));
        }),
      );
      renderChats();

      await user.click(await screen.findByRole('button', { name: 'Desarquivar' }));

      expect(await screen.findByText('Conversa desarquivada.')).toBeInTheDocument();
      expect(body).toEqual({ archived: false });
    });

    it('asks for confirmation before deleting', async () => {
      const user = userEvent.setup();
      const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false);
      let deleted = false;
      givenChats([buildChat({ id: uuid(20) })]);
      server.use(
        http.delete(api(`chats/${uuid(20)}/`), () => {
          deleted = true;
          return new HttpResponse(null, { status: 204 });
        }),
      );
      renderChats();

      await user.click(await screen.findByRole('button', { name: 'Excluir' }));

      expect(confirm).toHaveBeenCalled();
      expect(deleted).toBe(false);
    });

    it('deletes a conversation once confirmed and reloads the list', async () => {
      const user = userEvent.setup();
      vi.spyOn(window, 'confirm').mockReturnValue(true);
      let chats = [buildChat({ id: uuid(20) })];
      server.use(
        http.get(api('chats/'), () => HttpResponse.json(chats)),
        http.delete(api(`chats/${uuid(20)}/`), () => {
          chats = [];
          return new HttpResponse(null, { status: 204 });
        }),
      );
      renderChats();

      await user.click(await screen.findByRole('button', { name: 'Excluir' }));

      expect(await screen.findByText('Conversa excluída.')).toBeInTheDocument();
      expect(await screen.findByText('Nenhum chat encontrado.')).toBeInTheDocument();
    });
  });
});
