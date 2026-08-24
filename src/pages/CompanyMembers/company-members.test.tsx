import { HttpResponse, http } from 'msw';
import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders, screen, userEvent, waitFor } from '../../test/test-utils';
import { api } from '../../test/msw/handlers';
import { server } from '../../test/msw/server';
import { buildCompany, buildInvite, buildMember, uuid } from '../../test/factories';
import { CompanyMembers } from './company-members';

const company = buildCompany({ name: 'Acme' });

const renderMembers = () => renderWithProviders(<CompanyMembers />, { companies: [company] });

const openInvitesTab = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.click(screen.getByRole('tab', { name: 'Convites' }));
};

const openRowMenu = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.click(await screen.findByRole('button', { name: 'Abrir menu de ações' }));
};

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
      expect(screen.getByText('Owner')).toBeInTheDocument();
      expect(screen.getByText('Membro')).toBeInTheDocument();
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

      await screen.findByText('Owner');
      expect(screen.queryByRole('button', { name: 'Abrir menu de ações' })).not.toBeInTheDocument();
    });

    it('removes a member after the confirmation', async () => {
      const user = userEvent.setup();
      vi.spyOn(window, 'confirm').mockReturnValue(true);
      let removedId: string | undefined;
      server.use(
        http.get(api('memberships/members/'), () => HttpResponse.json([buildMember({ id: uuid(5) })])),
        http.delete(api('memberships/members/:membershipId'), ({ params }) => {
          removedId = params.membershipId as string;
          return new HttpResponse(null, { status: 204 });
        }),
      );
      renderMembers();

      await openRowMenu(user);
      await user.click(screen.getByRole('menuitem', { name: 'Remover membro' }));

      expect(await screen.findByText('Membro removido.')).toBeInTheDocument();
      expect(removedId).toBe(uuid(5));
    });

    it('keeps the member when the confirmation is dismissed', async () => {
      const user = userEvent.setup();
      vi.spyOn(window, 'confirm').mockReturnValue(false);
      let called = false;
      server.use(
        http.get(api('memberships/members/'), () => HttpResponse.json([buildMember()])),
        http.delete(api('memberships/members/:membershipId'), () => {
          called = true;
          return new HttpResponse(null, { status: 204 });
        }),
      );
      renderMembers();

      await openRowMenu(user);
      await user.click(screen.getByRole('menuitem', { name: 'Remover membro' }));

      await waitFor(() => expect(called).toBe(false));
    });

    it('reports the backend message when the removal fails', async () => {
      const user = userEvent.setup();
      vi.spyOn(window, 'confirm').mockReturnValue(true);
      server.use(
        http.get(api('memberships/members/'), () => HttpResponse.json([buildMember()])),
        http.delete(api('memberships/members/:membershipId'), () =>
          HttpResponse.json({ detail: 'Membro possui pendências.' }, { status: 400 }),
        ),
      );
      renderMembers();

      await openRowMenu(user);
      await user.click(screen.getByRole('menuitem', { name: 'Remover membro' }));

      expect(await screen.findByText('Membro possui pendências.')).toBeInTheDocument();
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
      vi.spyOn(window, 'confirm').mockReturnValue(true);
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
          return HttpResponse.json([buildInvite()]);
        }),
      );
      await openModal(user);

      const input = screen.getByPlaceholderText(/membro@empresa\.com/);
      await user.type(input, 'um@acme.com dois@acme.com');
      await user.click(screen.getByRole('button', { name: 'Enviar convites' }));

      await waitFor(() =>
        expect(body).toEqual({
          emails: ['um@acme.com', 'dois@acme.com'],
          permissions: [],
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
          return HttpResponse.json([buildInvite()]);
        }),
      );
      await openModal(user);

      await user.type(screen.getByPlaceholderText(/membro@empresa\.com/), 'so-um@acme.com');
      await user.click(screen.getByRole('button', { name: 'Enviar convites' }));

      await waitFor(() => expect(body).toMatchObject({ emails: ['so-um@acme.com'] }));
      expect(await screen.findByText('Convite enviado com sucesso!')).toBeInTheDocument();
    });

    it('rejects a malformed address before sending anything', async () => {
      const user = userEvent.setup();
      let called = false;
      server.use(
        http.put(api('memberships/invites/'), () => {
          called = true;
          return HttpResponse.json([]);
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
          return HttpResponse.json([]);
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
});
