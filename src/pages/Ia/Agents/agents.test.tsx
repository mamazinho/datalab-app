import { HttpResponse, http } from 'msw';
import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders, screen, userEvent, waitFor } from '../../../test/test-utils';
import { api } from '../../../test/msw/handlers';
import { server } from '../../../test/msw/server';
import {
  buildAgent,
  buildCompany,
  buildCurrentMembership,
  buildRoutePermission,
  uuid,
} from '../../../test/factories';
import type { IRetrieveAgentWithState } from '../../../services/datalab-api/agentsResource';
import type { IUserCompany } from '../../../services/datalab-api/usersResource';
import { Agents } from './agents';

type User = ReturnType<typeof userEvent.setup>;

const owner = buildCompany({ id: uuid(1), name: 'Acme' });
const member: IUserCompany = {
  ...owner,
  membership: { ...owner.membership, membership_role: 'member' },
};

const givenAgents = (agents: IRetrieveAgentWithState[]) => {
  server.use(http.get(api('agents/'), () => HttpResponse.json(agents)));
};

const givenPlainMember = () => {
  server.use(
    http.get(api('memberships/current/'), () =>
      HttpResponse.json(buildCurrentMembership({ membership_role: 'member', permissions: [] })),
    ),
  );
};

const givenMemberWithAgentUpdate = () => {
  server.use(
    http.get(api('memberships/current/'), () =>
      HttpResponse.json(
        buildCurrentMembership({
          membership_role: 'member',
          permissions: [buildRoutePermission({ method: 'PATCH', path: '/v1/agents/{agent_id}/' })],
        }),
      ),
    ),
  );
};

const renderAgents = (companies: IUserCompany[] = [owner]) =>
  renderWithProviders(<Agents />, { companies });

const openRowMenu = async (user: User) => {
  await user.click(await screen.findByRole('button', { name: 'Abrir menu de ações' }));
};

describe('<Agents />', () => {
  it('lists the agents with key, model and status', async () => {
    givenAgents([buildAgent({ name: 'Especialista GA4', key: 'ga4', model_name: 'gpt-4o' })]);
    renderAgents();

    expect(await screen.findByText('Especialista GA4')).toBeInTheDocument();
    expect(screen.getByText('ga4')).toBeInTheDocument();
    expect(screen.getByText('gpt-4o')).toBeInTheDocument();
    expect(screen.getByText('Ativo')).toBeInTheDocument();
  });

  it('shows an empty state when the company has no agents', async () => {
    renderAgents();

    expect(await screen.findByText('Nenhum agente encontrado.')).toBeInTheDocument();
  });

  it.each([
    ['Desativado pela empresa', { disabled_by_company: true, is_enabled: false }],
    ['Desativado por você', { disabled_by_user: true, is_enabled: false }],
    ['Inativo', { is_enabled: false }],
  ])('flags the agent as "%s"', async (label, state) => {
    givenAgents([buildAgent(state)]);
    renderAgents();

    expect(await screen.findByText(label)).toBeInTheDocument();
  });

  it('marks a system agent as such', async () => {
    givenAgents([buildAgent({ is_system: true })]);
    renderAgents();

    expect(await screen.findByText('Sistema')).toBeInTheDocument();
  });

  describe('permissions', () => {
    it('blocks creation for a member without the permission', async () => {
      givenPlainMember();
      renderAgents([member]);

      await waitFor(() =>
        expect(screen.getByRole('button', { name: '+ Criar agente' })).toBeDisabled(),
      );
      expect(screen.getByRole('button', { name: '+ Criar agente' })).toHaveAttribute(
        'title',
        'Você não tem permissão para criar agentes',
      );
    });

    it('never offers edit or delete on a system agent, not even to the owner', async () => {
      const user = userEvent.setup();
      givenAgents([buildAgent({ is_system: true })]);
      renderAgents();

      await openRowMenu(user);

      expect(screen.queryByRole('menuitem', { name: 'Editar' })).not.toBeInTheDocument();
      expect(screen.queryByRole('menuitem', { name: 'Excluir' })).not.toBeInTheDocument();
      expect(screen.getByRole('menuitem', { name: 'Desativar para você' })).toBeInTheDocument();
    });

    it('hides company-wide toggles from a member who can only edit', async () => {
      const user = userEvent.setup();
      givenMemberWithAgentUpdate();
      givenAgents([buildAgent()]);
      renderAgents([member]);

      await openRowMenu(user);

      expect(await screen.findByRole('menuitem', { name: 'Editar' })).toBeInTheDocument();
      expect(
        screen.queryByRole('menuitem', { name: 'Desativar para a empresa' }),
      ).not.toBeInTheDocument();
      expect(screen.queryByRole('menuitem', { name: 'Excluir' })).not.toBeInTheDocument();
    });
  });

  describe('creating', () => {
    it('sends the filled fields and closes the modal', async () => {
      const user = userEvent.setup({ delay: null });
      let body: unknown;
      server.use(
        http.post(api('agents/'), async ({ request }) => {
          body = await request.json();
          return HttpResponse.json(buildAgent(), { status: 201 });
        }),
      );
      renderAgents();

      await user.click(await screen.findByRole('button', { name: '+ Criar agente' }));
      await user.type(await screen.findByLabelText('Nome *'), 'Especialista Meta');
      await user.type(screen.getByLabelText('Descrição'), 'Cuida de anúncios');
      await user.type(screen.getByLabelText('Instruções *'), 'Responda sobre campanhas.');
      await user.click(screen.getByRole('button', { name: 'Criar agente' }));

      expect(await screen.findByText('Agente criado.')).toBeInTheDocument();
      expect(body).toMatchObject({
        name: 'Especialista Meta',
        description: 'Cuida de anúncios',
        instructions: 'Responda sobre campanhas.',
      });
      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    });

    it('does not submit an avatar that is not a valid URL', async () => {
      const user = userEvent.setup({ delay: null });
      let called = false;
      server.use(
        http.post(api('agents/'), () => {
          called = true;
          return HttpResponse.json(buildAgent(), { status: 201 });
        }),
      );
      renderAgents();

      await user.click(await screen.findByRole('button', { name: '+ Criar agente' }));
      await user.type(await screen.findByLabelText('Nome *'), 'Especialista Meta');
      await user.type(screen.getByLabelText('Instruções *'), 'Responda sobre campanhas.');
      const avatar = screen.getByLabelText('URL do avatar');
      await user.type(avatar, 'nao-e-url');
      await user.click(screen.getByRole('button', { name: 'Criar agente' }));

      expect(avatar).toBeInvalid();
      await waitFor(() => expect(called).toBe(false));
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });

  describe('editing', () => {
    it('pre-fills the form and accepts empty instructions to keep the current ones', async () => {
      const user = userEvent.setup({ delay: null });
      let body: unknown;
      givenAgents([buildAgent({ id: uuid(10), name: 'Especialista GA4' })]);
      server.use(
        http.patch(api(`agents/${uuid(10)}/`), async ({ request }) => {
          body = await request.json();
          return HttpResponse.json(buildAgent());
        }),
      );
      renderAgents();
      await openRowMenu(user);
      await user.click(screen.getByRole('menuitem', { name: 'Editar' }));

      expect(await screen.findByLabelText('Nome *')).toHaveValue('Especialista GA4');
      expect(screen.getByLabelText('Instruções')).toHaveValue('');

      await user.click(screen.getByRole('button', { name: 'Salvar alterações' }));

      expect(await screen.findByText('Agente atualizado.')).toBeInTheDocument();
      expect(body).not.toHaveProperty('instructions');
    });
  });

  describe('availability toggles', () => {
    it('disables the agent for the whole company', async () => {
      const user = userEvent.setup();
      let body: unknown;
      givenAgents([buildAgent({ id: uuid(10), disabled_by_company: false })]);
      server.use(
        http.put(api(`agents/${uuid(10)}/company-state/`), async ({ request }) => {
          body = await request.json();
          return new HttpResponse(null, { status: 204 });
        }),
      );
      renderAgents();
      await openRowMenu(user);

      await user.click(screen.getByRole('menuitem', { name: 'Desativar para a empresa' }));

      expect(await screen.findByText('Agente desativado para a empresa.')).toBeInTheDocument();
      expect(body).toEqual({ enabled: false });
    });

    it('re-enables an agent the company had disabled', async () => {
      const user = userEvent.setup();
      let body: unknown;
      givenAgents([buildAgent({ id: uuid(10), disabled_by_company: true, is_enabled: false })]);
      server.use(
        http.put(api(`agents/${uuid(10)}/company-state/`), async ({ request }) => {
          body = await request.json();
          return new HttpResponse(null, { status: 204 });
        }),
      );
      renderAgents();
      await openRowMenu(user);

      await user.click(screen.getByRole('menuitem', { name: 'Ativar para a empresa' }));

      expect(await screen.findByText('Agente ativado para a empresa.')).toBeInTheDocument();
      expect(body).toEqual({ enabled: true });
    });

    it('toggles only the personal preference', async () => {
      const user = userEvent.setup();
      let body: unknown;
      givenAgents([buildAgent({ id: uuid(10), disabled_by_user: false })]);
      server.use(
        http.put(api(`agents/${uuid(10)}/user-state/`), async ({ request }) => {
          body = await request.json();
          return new HttpResponse(null, { status: 204 });
        }),
      );
      renderAgents();
      await openRowMenu(user);

      await user.click(screen.getByRole('menuitem', { name: 'Desativar para você' }));

      expect(await screen.findByText('Agente desativado para você.')).toBeInTheDocument();
      expect(body).toEqual({ enabled: false });
    });
  });

  describe('deleting', () => {
    it('asks for confirmation before removing', async () => {
      const user = userEvent.setup();
      vi.spyOn(window, 'confirm').mockReturnValue(false);
      let called = false;
      givenAgents([buildAgent({ id: uuid(10) })]);
      server.use(
        http.delete(api(`agents/${uuid(10)}/`), () => {
          called = true;
          return new HttpResponse(null, { status: 204 });
        }),
      );
      renderAgents();
      await openRowMenu(user);

      await user.click(screen.getByRole('menuitem', { name: 'Excluir' }));

      await waitFor(() => expect(called).toBe(false));
    });

    it('removes the agent once confirmed', async () => {
      const user = userEvent.setup();
      vi.spyOn(window, 'confirm').mockReturnValue(true);
      let deleted = false;
      givenAgents([buildAgent({ id: uuid(10) })]);
      server.use(
        http.delete(api(`agents/${uuid(10)}/`), () => {
          deleted = true;
          return new HttpResponse(null, { status: 204 });
        }),
      );
      renderAgents();
      await openRowMenu(user);

      await user.click(screen.getByRole('menuitem', { name: 'Excluir' }));

      expect(await screen.findByText('Agente excluído.')).toBeInTheDocument();
      expect(deleted).toBe(true);
    });

    it('reports the backend refusal', async () => {
      const user = userEvent.setup();
      vi.spyOn(window, 'confirm').mockReturnValue(true);
      givenAgents([buildAgent({ id: uuid(10) })]);
      server.use(
        http.delete(api(`agents/${uuid(10)}/`), () =>
          HttpResponse.json({ detail: 'Agente em uso por um chat.' }, { status: 409 }),
        ),
      );
      renderAgents();
      await openRowMenu(user);

      await user.click(screen.getByRole('menuitem', { name: 'Excluir' }));

      expect(await screen.findByText('Agente em uso por um chat.')).toBeInTheDocument();
    });
  });
});
