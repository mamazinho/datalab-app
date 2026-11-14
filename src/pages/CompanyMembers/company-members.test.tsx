import { HttpResponse, http } from 'msw';
import { describe, expect, it } from 'vitest';
import { renderWithProviders, screen, userEvent, waitFor, within } from '../../test/test-utils';
import { api, apiErrorResponse } from '../../test/msw/handlers';
import { server } from '../../test/msw/server';
import {
  buildCompany,
  buildCurrentMembership,
  buildInvite,
  buildMember,
  buildRoutePermission,
  uuid,
} from '../../test/factories';
import { CompanyMembers } from './company-members';

const company = buildCompany({ name: 'Acme' });

const renderMembers = () => renderWithProviders(<CompanyMembers />, { companies: [company] });

const openInvitesTab = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.click(screen.getByRole('tab', { name: 'Convites' }));
};

const openRowMenu = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.click(await screen.findByRole('button', { name: 'Abrir menu de ações' }));
};

const answerConfirmation = (user: ReturnType<typeof userEvent.setup>, title: string, answer: string) =>
  user.click(within(screen.getByRole('dialog', { name: title })).getByRole('button', { name: answer }));

describe('<CompanyMembers />', () => {
  it('shows the active company in the header', async () => {
    renderMembers();

    expect(await screen.findByText(/Acme ·/)).toBeInTheDocument();
  });

  describe('members tab', () => {
    it('lists each member with role and e-mail', async () => {
      server.use(
        http.get(api('memberships/members/'), () =>
          HttpResponse.json([
            buildMember({ id: uuid(5), membership_role: 'owner', user: { id: uuid(3), name: 'Ana Souza', email: 'ana@datalab.com' } }),
            buildMember({ id: uuid(6), membership_role: 'member' }),
          ]),
        ),
      );
      renderMembers();

      expect(await screen.findByText('Ana Souza')).toBeInTheDocument();
      expect(screen.getByText('bruno@datalab.com')).toBeInTheDocument();
      expect(screen.getByText('Proprietário')).toBeInTheDocument();
      expect(screen.getByText('Membro')).toBeInTheDocument();
    });

    it('shows the status in its own column, in Portuguese', async () => {
      server.use(
        http.get(api('memberships/members/'), () =>
          HttpResponse.json([
            buildMember({ id: uuid(5), status: 'active' }),
            buildMember({ id: uuid(6), status: 'inactive', user: { id: uuid(7), name: 'Carla Dias', email: 'carla@datalab.com' } }),
          ]),
        ),
      );
      renderMembers();

      expect(await screen.findByRole('columnheader', { name: 'Status' })).toBeInTheDocument();
      expect(screen.getByText('Ativo')).toBeInTheDocument();
      expect(screen.getByText('Inativo')).toBeInTheDocument();
    });

    it('asks only for active members until ex-members are shown', async () => {
      const user = userEvent.setup();
      const statusParams: (string | null)[] = [];
      server.use(
        http.get(api('memberships/members/'), ({ request }) => {
          statusParams.push(new URL(request.url).searchParams.get('status'));
          return HttpResponse.json([]);
        }),
      );
      renderMembers();

      await screen.findByText('Nenhum membro encontrado.');
      await user.click(screen.getByRole('switch', { name: 'Mostrar ex-membros' }));

      await waitFor(() => expect(statusParams).toEqual(['active', null]));
    });

    it('offers only the reactivation on an ex-member', async () => {
      const user = userEvent.setup();
      server.use(
        http.get(api('memberships/members/'), () => HttpResponse.json([buildMember({ status: 'inactive' })])),
      );
      renderMembers();

      await user.click(await screen.findByRole('switch', { name: 'Mostrar ex-membros' }));
      await openRowMenu(user);

      expect(screen.getByRole('menuitem', { name: 'Reativar membro' })).toBeInTheDocument();
      expect(screen.queryByRole('menuitem', { name: 'Remover membro' })).not.toBeInTheDocument();
      expect(screen.queryByRole('menuitem', { name: 'Editar permissões' })).not.toBeInTheDocument();
    });

    it('reactivates an ex-member after the confirmation', async () => {
      const user = userEvent.setup();
      let reactivatedId: string | undefined;
      let reactivatedBody: unknown;
      server.use(
        http.get(api('memberships/members/'), () =>
          HttpResponse.json([buildMember({ id: uuid(5), status: 'inactive' })]),
        ),
        http.patch(api('memberships/members/:membershipId/'), async ({ params, request }) => {
          reactivatedId = params.membershipId as string;
          reactivatedBody = await request.json();
          return HttpResponse.json(buildMember({ id: uuid(5) }));
        }),
      );
      renderMembers();

      await user.click(await screen.findByRole('switch', { name: 'Mostrar ex-membros' }));
      await openRowMenu(user);
      await user.click(screen.getByRole('menuitem', { name: 'Reativar membro' }));
      await answerConfirmation(user, 'Reativar membro', 'Reativar');

      expect(await screen.findByText('Membro reativado.')).toBeInTheDocument();
      expect(reactivatedId).toBe(uuid(5));
      expect(reactivatedBody).toEqual({ status: 'active' });
    });

    it('shows an empty state when the company has no members', async () => {
      renderMembers();

      expect(await screen.findByText('Nenhum membro encontrado.')).toBeInTheDocument();
    });

    it('does not offer destructive actions on the owner', async () => {
      server.use(
        http.get(api('memberships/members/'), () =>
          HttpResponse.json([buildMember({ membership_role: 'owner' })]),
        ),
      );
      renderMembers();

      await screen.findByText('Proprietário');
      expect(screen.queryByRole('button', { name: 'Abrir menu de ações' })).not.toBeInTheDocument();
    });

    it('removes a member after the confirmation', async () => {
      const user = userEvent.setup();
      let removedId: string | undefined;
      let removedBody: unknown;
      server.use(
        http.get(api('memberships/members/'), () => HttpResponse.json([buildMember({ id: uuid(5) })])),
        http.patch(api('memberships/members/:membershipId/'), async ({ params, request }) => {
          removedId = params.membershipId as string;
          removedBody = await request.json();
          return HttpResponse.json(buildMember({ id: uuid(5), status: 'inactive' }));
        }),
      );
      renderMembers();

      await openRowMenu(user);
      await user.click(screen.getByRole('menuitem', { name: 'Remover membro' }));
      await answerConfirmation(user, 'Remover membro', 'Remover');

      expect(await screen.findByText('Membro removido.')).toBeInTheDocument();
      expect(removedId).toBe(uuid(5));
      expect(removedBody).toEqual({ status: 'inactive' });
    });

    it('keeps the member when the confirmation is dismissed', async () => {
      const user = userEvent.setup();
      let called = false;
      server.use(
        http.get(api('memberships/members/'), () => HttpResponse.json([buildMember()])),
        http.patch(api('memberships/members/:membershipId/'), () => {
          called = true;
          return HttpResponse.json(buildMember({ status: 'inactive' }));
        }),
      );
      renderMembers();

      await openRowMenu(user);
      await user.click(screen.getByRole('menuitem', { name: 'Remover membro' }));
      await answerConfirmation(user, 'Remover membro', 'Cancelar');

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      await waitFor(() => expect(called).toBe(false));
    });

    it('reports the backend message when the removal fails', async () => {
      const user = userEvent.setup();
      server.use(
        http.get(api('memberships/members/'), () => HttpResponse.json([buildMember()])),
        http.patch(api('memberships/members/:membershipId/'), () =>
          apiErrorResponse(400, 'Membro possui pendências.'),
        ),
      );
      renderMembers();

      await openRowMenu(user);
      await user.click(screen.getByRole('menuitem', { name: 'Remover membro' }));
      await answerConfirmation(user, 'Remover membro', 'Remover');

      expect(await screen.findByText('Membro possui pendências.')).toBeInTheDocument();
    });
  });

  describe('ownership transfer', () => {
    it('lets the owner hand the company over to an active member', async () => {
      const user = userEvent.setup();
      let body: unknown;
      server.use(
        http.get(api('memberships/members/'), () => HttpResponse.json([buildMember({ id: uuid(5) })])),
        http.post(api('memberships/transfer-ownership'), async ({ request }) => {
          body = await request.json();
          return HttpResponse.json(buildMember({ id: uuid(5), membership_role: 'owner' }));
        }),
      );
      renderMembers();

      await openRowMenu(user);
      await user.click(await screen.findByRole('menuitem', { name: 'Transferir posse' }));
      await answerConfirmation(user, 'Transferir posse', 'Transferir');

      expect(await screen.findByText('Bruno Lima agora é o proprietário da empresa.')).toBeInTheDocument();
      expect(body).toEqual({ new_owner_membership_id: uuid(5) });
    });

    it('offers the transfer only to the owner', async () => {
      const user = userEvent.setup();
      server.use(
        http.get(api('memberships/current/'), () =>
          HttpResponse.json(
            buildCurrentMembership({
              membership_role: 'member',
              route_permissions: [
                buildRoutePermission({ method: 'GET', path: '/v1/memberships/members/' }),
                buildRoutePermission({ method: 'PATCH', path: '/v1/memberships/members/{membership_id}/' }),
              ],
            }),
          ),
        ),
        http.get(api('memberships/members/'), () => HttpResponse.json([buildMember()])),
      );
      renderMembers();

      await openRowMenu(user);

      expect(await screen.findByRole('menuitem', { name: 'Remover membro' })).toBeInTheDocument();
      expect(screen.queryByRole('menuitem', { name: 'Transferir posse' })).not.toBeInTheDocument();
    });
  });

  describe('invites tab', () => {
    it('lists the sent invites with status and sender', async () => {
      const user = userEvent.setup();
      server.use(
        http.get(api('memberships/invites/'), () =>
          HttpResponse.json([buildInvite({ email: 'novo@acme.com', status: 'pending' })]),
        ),
      );
      renderMembers();
      await screen.findByText('Nenhum membro encontrado.');

      await openInvitesTab(user);

      expect(await screen.findByText('novo@acme.com')).toBeInTheDocument();
      expect(screen.getByText('Pendente')).toBeInTheDocument();
      expect(screen.getByText('Carla Dias')).toBeInTheDocument();
    });

    it('shows an empty state when nothing was sent yet', async () => {
      const user = userEvent.setup();
      renderMembers();
      await screen.findByText('Nenhum membro encontrado.');

      await openInvitesTab(user);

      expect(await screen.findByText('Nenhum convite enviado ainda.')).toBeInTheDocument();
    });

    it('deletes an invite after the confirmation', async () => {
      const user = userEvent.setup();
      let deletedId: string | undefined;
      server.use(
        http.get(api('memberships/invites/'), () => HttpResponse.json([buildInvite({ id: uuid(7) })])),
        http.delete(api('memberships/invites/:inviteId'), ({ params }) => {
          deletedId = params.inviteId as string;
          return new HttpResponse(null, { status: 204 });
        }),
      );
      renderMembers();
      await screen.findByText('Nenhum membro encontrado.');
      await openInvitesTab(user);

      await openRowMenu(user);
      await user.click(screen.getByRole('menuitem', { name: 'Excluir convite' }));
      await answerConfirmation(user, 'Remover convite', 'Remover');

      expect(await screen.findByText('Convite removido.')).toBeInTheDocument();
      expect(deletedId).toBe(uuid(7));
    });
  });

  describe('invite modal', () => {
    const openModal = async (user: ReturnType<typeof userEvent.setup>) => {
      renderMembers();
      await screen.findByText('Nenhum membro encontrado.');
      await user.click(screen.getByRole('button', { name: '+ Convidar membros' }));
      return screen.findByRole('dialog');
    };

    it('turns typed addresses into tags and sends them all', async () => {
      const user = userEvent.setup();
      let body: unknown;
      server.use(
        http.put(api('memberships/invites/'), async ({ request }) => {
          body = await request.json();
          return HttpResponse.json({
            invites: [buildInvite({ email: 'um@acme.com' }), buildInvite({ email: 'dois@acme.com' })],
            already_members: [],
            already_invited: [],
          });
        }),
      );
      await openModal(user);

      const input = screen.getByPlaceholderText(/membro@empresa\.com/);
      await user.type(input, 'um@acme.com dois@acme.com');
      await user.click(screen.getByRole('button', { name: 'Enviar convites' }));

      await waitFor(() =>
        expect(body).toEqual({
          emails: ['um@acme.com', 'dois@acme.com'],
          route_permissions: [],
          provider_permissions: [],
        }),
      );
      expect(await screen.findByText('2 convites enviados com sucesso!')).toBeInTheDocument();
    });

    it('accepts a single address left in the draft, without a separator', async () => {
      const user = userEvent.setup();
      let body: unknown;
      server.use(
        http.put(api('memberships/invites/'), async ({ request }) => {
          body = await request.json();
          return HttpResponse.json({ invites: [buildInvite()], already_members: [], already_invited: [] });
        }),
      );
      await openModal(user);

      await user.type(screen.getByPlaceholderText(/membro@empresa\.com/), 'so-um@acme.com');
      await user.click(screen.getByRole('button', { name: 'Enviar convites' }));

      await waitFor(() => expect(body).toMatchObject({ emails: ['so-um@acme.com'] }));
      expect(await screen.findByText('Convite enviado com sucesso!')).toBeInTheDocument();
    });

    it('sends the other invites and warns apart about members and pending invites', async () => {
      const user = userEvent.setup();
      server.use(
        http.put(api('memberships/invites/'), () =>
          HttpResponse.json({
            invites: [buildInvite({ email: 'novo@acme.com' })],
            already_members: ['membro@acme.com'],
            already_invited: ['convidado@acme.com'],
          }),
        ),
      );
      await openModal(user);

      await user.type(screen.getByPlaceholderText(/membro@empresa\.com/), 'membro@acme.com convidado@acme.com novo@acme.com');
      await user.click(screen.getByRole('button', { name: 'Enviar convites' }));

      expect(await screen.findByText('Convite enviado com sucesso!')).toBeInTheDocument();
      expect(
        screen.getByText('membro@acme.com já é membro da empresa e não recebeu um novo convite.'),
      ).toBeInTheDocument();
      expect(
        screen.getByText('convidado@acme.com já tem um convite pendente e não recebeu um novo e-mail.'),
      ).toBeInTheDocument();
      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    });

    it('warns in a toast and keeps every address and permission when the invite fails', async () => {
      const user = userEvent.setup();
      const listChats = buildRoutePermission({ id: uuid(10), method: 'GET', path: '/v1/chats/', tag: 'chat', description: 'Listagem de chats' });
      const message = 'membro@acme.com já faz parte da empresa. Nenhum convite foi enviado.';
      server.use(
        http.get(api('memberships/route-permissions/'), () => HttpResponse.json([listChats])),
        http.put(api('memberships/invites/'), () =>
          apiErrorResponse(409, message, 'AlreadyCompanyMemberFriendlyException'),
        ),
      );
      await openModal(user);

      await user.type(screen.getByPlaceholderText(/membro@empresa\.com/), 'membro@acme.com novo@acme.com ');
      await user.click(await screen.findByRole('checkbox', { name: /Listagem de chats/ }));
      await user.click(screen.getByRole('button', { name: 'Enviar convites' }));

      expect(await screen.findByRole('alert')).toHaveTextContent(message);
      const dialog = screen.getByRole('dialog');
      expect(within(dialog).getByText('membro@acme.com')).toBeInTheDocument();
      expect(within(dialog).getByText('novo@acme.com')).toBeInTheDocument();
      expect(within(dialog).getByRole('checkbox', { name: /Listagem de chats/ })).toBeChecked();
    });

    it('rejects a malformed address before sending anything', async () => {
      const user = userEvent.setup();
      let called = false;
      server.use(
        http.put(api('memberships/invites/'), () => {
          called = true;
          return HttpResponse.json({ invites: [], already_members: [], already_invited: [] });
        }),
      );
      await openModal(user);

      await user.type(screen.getByPlaceholderText(/membro@empresa\.com/), 'nao-e-email ');

      expect(await screen.findByText(/não é um e-mail válido/)).toBeInTheDocument();
      expect(called).toBe(false);
    });

    it('refuses to submit with no recipient', async () => {
      const user = userEvent.setup();
      let called = false;
      server.use(
        http.put(api('memberships/invites/'), () => {
          called = true;
          return HttpResponse.json({ invites: [], already_members: [], already_invited: [] });
        }),
      );
      await openModal(user);

      await user.click(screen.getByRole('button', { name: 'Enviar convites' }));

      expect(await screen.findByText('Adicione ao menos um e-mail.')).toBeInTheDocument();
      expect(called).toBe(false);
    });

    it('lets the user drop a recipient before sending', async () => {
      const user = userEvent.setup();
      await openModal(user);

      await user.type(screen.getByPlaceholderText(/membro@empresa\.com/), 'um@acme.com ');
      await user.click(screen.getByRole('button', { name: 'Remover um@acme.com' }));

      expect(screen.queryByText('um@acme.com')).not.toBeInTheDocument();
    });

    it('closes on Escape', async () => {
      const user = userEvent.setup();
      await openModal(user);

      await user.keyboard('{Escape}');

      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    });
  });

  describe('as a member', () => {
    const asMember = { ...company, membership: { ...company.membership, membership_role: 'member' as const } };

    const renderAsMemberWith = (paths: [method: string, path: string][]) => {
      server.use(
        http.get(api('memberships/current/'), () =>
          HttpResponse.json(
            buildCurrentMembership({
              membership_role: 'member',
              route_permissions: paths.map(([method, path]) => buildRoutePermission({ method, path, tag: 'memberships' })),
            }),
          ),
        ),
        http.get(api('memberships/members/'), () => HttpResponse.json([buildMember()])),
      );
      renderWithProviders(<CompanyMembers />, { companies: [asMember] });
    };

    it('hides invite and member actions from someone who can only list', async () => {
      renderAsMemberWith([['GET', '/v1/memberships/members/']]);

      expect(await screen.findByText('Bruno Lima')).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: '+ Convidar membros' })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Abrir menu de ações' })).not.toBeInTheDocument();
    });

    it('offers only the actions whose routes were granted', async () => {
      const user = userEvent.setup();
      renderAsMemberWith([
        ['GET', '/v1/memberships/members/'],
        ['PUT', '/v1/memberships/invites/'],
        ['PATCH', '/v1/memberships/members/{membership_id}/'],
      ]);

      expect(await screen.findByRole('button', { name: '+ Convidar membros' })).toBeInTheDocument();
      await openRowMenu(user);
      expect(await screen.findByRole('menuitem', { name: 'Remover membro' })).toBeInTheDocument();
      expect(screen.queryByRole('menuitem', { name: 'Editar permissões' })).not.toBeInTheDocument();
    });

    it('offers editing permissions only together with the reads the modal makes', async () => {
      const user = userEvent.setup();
      renderAsMemberWith([
        ['GET', '/v1/memberships/members/'],
        ['PUT', '/v1/memberships/members/{membership_id}/permissions/'],
        ['PATCH', '/v1/memberships/members/{membership_id}/'],
      ]);

      await openRowMenu(user);

      expect(await screen.findByRole('menuitem', { name: 'Remover membro' })).toBeInTheDocument();
      expect(screen.queryByRole('menuitem', { name: 'Editar permissões' })).not.toBeInTheDocument();
    });

    it('offers editing permissions when the member can also read the current grants', async () => {
      const user = userEvent.setup();
      renderAsMemberWith([
        ['GET', '/v1/memberships/members/'],
        ['PUT', '/v1/memberships/members/{membership_id}/permissions/'],
        ['GET', '/v1/memberships/members/{membership_id}/route-permissions/'],
        ['GET', '/v1/memberships/members/{membership_id}/provider-permissions/'],
      ]);

      await openRowMenu(user);

      expect(await screen.findByRole('menuitem', { name: 'Editar permissões' })).toBeInTheDocument();
    });

    it('shows only the tabs whose list the member can read', async () => {
      renderAsMemberWith([['GET', '/v1/memberships/invites/']]);

      expect(await screen.findByText('Nenhum convite enviado ainda.')).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'Convites' })).toBeInTheDocument();
      expect(screen.queryByRole('tab', { name: 'Membros' })).not.toBeInTheDocument();
    });

    it('hides the invites tab from someone who can only list members', async () => {
      renderAsMemberWith([['GET', '/v1/memberships/members/']]);

      expect(await screen.findByText('Bruno Lima')).toBeInTheDocument();
      expect(screen.queryByRole('tab', { name: 'Convites' })).not.toBeInTheDocument();
    });
  });

  describe('member permissions modal', () => {
    const listChats = buildRoutePermission({ id: uuid(10), method: 'GET', path: '/v1/chats/', tag: 'chat', description: 'Listagem de chats' });
    const createChat = buildRoutePermission({ id: uuid(11), method: 'POST', path: '/v1/chats/', tag: 'chat', description: 'Criação de chat' });

    const openPermissions = async (user: ReturnType<typeof userEvent.setup>) => {
      server.use(
        http.get(api('memberships/members/'), () => HttpResponse.json([buildMember({ id: uuid(5) })])),
        http.get(api('memberships/route-permissions/'), () => HttpResponse.json([listChats, createChat])),
        http.get(api(`memberships/members/${uuid(5)}/route-permissions/`), () =>
          HttpResponse.json([{ id: uuid(20), membership_id: uuid(5), route_permission_id: listChats.id, route_permission: listChats }]),
        ),
        http.get(api(`memberships/members/${uuid(5)}/provider-permissions/`), () => HttpResponse.json([])),
      );
      renderMembers();
      await openRowMenu(user);
      await user.click(await screen.findByRole('menuitem', { name: 'Editar permissões' }));
      return screen.findByRole('dialog');
    };

    it('starts from what the member already has', async () => {
      const user = userEvent.setup();
      await openPermissions(user);

      expect(await screen.findByRole('checkbox', { name: /Listagem de chats/ })).toBeChecked();
      expect(screen.getByRole('checkbox', { name: /Criação de chat/ })).not.toBeChecked();
    });

    it('saves the whole selection in one request and closes', async () => {
      const user = userEvent.setup();
      let body: unknown;
      server.use(
        http.put(api(`memberships/members/${uuid(5)}/permissions/`), async ({ request }) => {
          body = await request.json();
          return new HttpResponse(null, { status: 204 });
        }),
      );
      await openPermissions(user);

      await user.click(await screen.findByRole('checkbox', { name: /Criação de chat/ }));
      await user.click(screen.getByRole('button', { name: 'Salvar permissões' }));

      expect(await screen.findByText('Permissões salvas com sucesso!')).toBeInTheDocument();
      expect(body).toEqual({ route_permissions: [listChats.id, createChat.id], provider_permissions: [] });
      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    });

    it('keeps the modal open with the backend message when saving fails', async () => {
      const user = userEvent.setup();
      server.use(
        http.put(api(`memberships/members/${uuid(5)}/permissions/`), () =>
          apiErrorResponse(404, 'Route permission not found'),
        ),
      );
      await openPermissions(user);

      await screen.findByRole('checkbox', { name: /Listagem de chats/ });
      await user.click(screen.getByRole('button', { name: 'Salvar permissões' }));

      expect(await screen.findByText('Route permission not found')).toBeInTheDocument();
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });
});
