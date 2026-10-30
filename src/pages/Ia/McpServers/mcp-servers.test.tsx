import { HttpResponse, http } from 'msw';
import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders, screen, userEvent, waitFor, within } from '../../../test/test-utils';
import { api } from '../../../test/msw/handlers';
import { server } from '../../../test/msw/server';
import {
  buildAgent,
  buildCompany,
  buildCurrentMembership,
  buildMcpServer,
  buildMcpServerTestResult,
  buildRoutePermission,
  uuid,
} from '../../../test/factories';
import type { IRetrieveMcpServer } from '../../../services/datalab-api/mcpServersResource';
import type { IRoutePermission, IUserCompany } from '../../../services/datalab-api/usersResource';
import { McpServers } from './mcp-servers';

type User = ReturnType<typeof userEvent.setup>;

const owner = buildCompany({ id: uuid(1), name: 'Acme' });
const member: IUserCompany = { ...owner, membership: { ...owner.membership, membership_role: 'member' } };

const systemAgent = buildAgent({ id: uuid(10), name: 'Especialista GA4', is_system: true });
const crmAgent = buildAgent({ id: uuid(11), name: 'Especialista CRM' });

const givenSavedServer = (overrides: Partial<IRetrieveMcpServer> = {}) => {
  server.use(
    http.get(api('agents/mcp-servers/'), () =>
      HttpResponse.json([buildMcpServer({ agent_id: crmAgent.id, agent_name: crmAgent.name, ...overrides })]),
    ),
  );
};

const givenMemberPermissions = (permissions: IRoutePermission[]) => {
  server.use(
    http.get(api('memberships/current/'), () =>
      HttpResponse.json(buildCurrentMembership({ membership_role: 'member', route_permissions: permissions })),
    ),
  );
};

const captureBody = (method: 'post' | 'patch', path: string, response: object = buildMcpServer()) => {
  const captured: { body?: unknown } = {};
  server.use(
    http[method](api(path), async ({ request }) => {
      captured.body = await request.json();
      return HttpResponse.json(response);
    }),
  );
  return captured;
};

const openCreateModal = async (user: User) => {
  await user.click(await screen.findByRole('button', { name: '+ Adicionar MCP' }));
  await user.selectOptions(await screen.findByLabelText('Agente *'), 'Especialista CRM');
  await user.type(screen.getByLabelText('Nome *'), 'CRM interno');
  await user.type(screen.getByLabelText('URL *'), 'https://mcp.acme.com/mcp');
};

const openEditModal = async (user: User) => {
  await user.click(await screen.findByRole('button', { name: 'Abrir menu de ações' }));
  await user.click(screen.getByRole('menuitem', { name: 'Editar' }));
};

describe('<McpServers />', () => {
  it('lists the servers with agent, URL and authentication', async () => {
    givenSavedServer({ name: 'CRM interno', url: 'https://mcp.acme.com/mcp', auth_type: 'bearer' });
    renderWithProviders(<McpServers />, { companies: [owner] });

    expect(await screen.findByText('CRM interno')).toBeInTheDocument();
    expect(screen.getByText('Especialista CRM')).toBeInTheDocument();
    expect(screen.getByText('https://mcp.acme.com/mcp')).toBeInTheDocument();
    expect(screen.getByText('Bearer token')).toBeInTheDocument();
  });

  it('shows an empty state when there is no server yet', async () => {
    renderWithProviders(<McpServers />, { companies: [owner] });

    expect(await screen.findByText('Nenhum servidor MCP cadastrado.')).toBeInTheDocument();
  });

  describe('permissions', () => {
    it('blocks creation for a member without the permission', async () => {
      givenMemberPermissions([]);
      renderWithProviders(<McpServers />, { companies: [member] });

      await waitFor(() => expect(screen.getByRole('button', { name: '+ Adicionar MCP' })).toBeDisabled());
    });

    it('offers only editing to a member who can only update', async () => {
      const user = userEvent.setup();
      givenMemberPermissions([
        buildRoutePermission({ method: 'PATCH', path: '/v1/agents/mcp-servers/{mcp_server_id}/' }),
      ]);
      givenSavedServer();
      renderWithProviders(<McpServers />, { companies: [member] });

      await user.click(await screen.findByRole('button', { name: 'Abrir menu de ações' }));

      expect(screen.getByRole('menuitem', { name: 'Editar' })).toBeInTheDocument();
      expect(screen.queryByRole('menuitem', { name: 'Remover' })).not.toBeInTheDocument();
    });
  });

  describe('creating', () => {
    it('offers only the company agents and locks the fields until one is chosen', async () => {
      const user = userEvent.setup();
      server.use(http.get(api('agents/'), () => HttpResponse.json([systemAgent, crmAgent])));
      renderWithProviders(<McpServers />, { companies: [owner] });

      await user.click(await screen.findByRole('button', { name: '+ Adicionar MCP' }));
      const agentSelect = await screen.findByLabelText('Agente *');

      expect(within(agentSelect).queryByRole('option', { name: 'Especialista GA4' })).not.toBeInTheDocument();
      expect(screen.getByLabelText('URL *')).toBeDisabled();

      await user.selectOptions(agentSelect, 'Especialista CRM');

      expect(screen.getByLabelText('URL *')).toBeEnabled();
    });

    it.each<[string, (user: User) => Promise<void>, object]>([
      ['Nenhuma', async () => {}, { type: 'none' }],
      ['Bearer token', (user) => user.type(screen.getByLabelText('Token'), 'tok-123'), { type: 'bearer', token: 'tok-123' }],
      [
        'Header personalizado',
        async (user) => {
          await user.type(screen.getByLabelText('Nome do header'), 'X-Api-Key');
          await user.type(screen.getByLabelText('Valor do header'), 'segredo');
        },
        { type: 'static_header', header_name: 'X-Api-Key', header_value: 'segredo' },
      ],
    ])('creates a server authenticated by "%s"', async (authLabel, fillCredential, auth) => {
      const user = userEvent.setup({ delay: null });
      server.use(http.get(api('agents/'), () => HttpResponse.json([crmAgent])));
      const request = captureBody('post', 'agents/mcp-servers/');
      renderWithProviders(<McpServers />, { companies: [owner] });

      await openCreateModal(user);
      await user.selectOptions(screen.getByLabelText('Autenticação'), authLabel);
      await fillCredential(user);
      await user.click(screen.getByRole('button', { name: 'Adicionar servidor' }));

      expect(await screen.findByText('Servidor MCP adicionado.')).toBeInTheDocument();
      expect(request.body).toEqual({
        agent_id: crmAgent.id,
        name: 'CRM interno',
        url: 'https://mcp.acme.com/mcp',
        transport: 'streamable_http',
        auth,
      });
    });

    it('shows the API refusal inside the modal', async () => {
      const user = userEvent.setup({ delay: null });
      server.use(
        http.get(api('agents/'), () => HttpResponse.json([crmAgent])),
        http.post(api('agents/mcp-servers/'), () =>
          HttpResponse.json({ detail: 'Já existe um MCP com esse nome.' }, { status: 409 }),
        ),
      );
      renderWithProviders(<McpServers />, { companies: [owner] });

      await openCreateModal(user);
      await user.click(screen.getByRole('button', { name: 'Adicionar servidor' }));

      expect(
        await screen.findByText('Falha ao salvar o servidor MCP: Já existe um MCP com esse nome.'),
      ).toBeInTheDocument();
    });
  });

  describe('editing', () => {
    it('keeps the saved secret when it is left blank', async () => {
      const user = userEvent.setup({ delay: null });
      server.use(http.get(api('agents/'), () => HttpResponse.json([crmAgent])));
      givenSavedServer({ id: uuid(30), auth_type: 'bearer' });
      const request = captureBody('patch', `agents/mcp-servers/${uuid(30)}/`);
      renderWithProviders(<McpServers />, { companies: [owner] });

      await openEditModal(user);
      await user.click(await screen.findByRole('button', { name: 'Salvar alterações' }));

      expect(await screen.findByText('Servidor MCP atualizado.')).toBeInTheDocument();
      expect(request.body).not.toHaveProperty('auth');
    });

    it('sends the new authentication when the type changes', async () => {
      const user = userEvent.setup({ delay: null });
      server.use(http.get(api('agents/'), () => HttpResponse.json([crmAgent])));
      givenSavedServer({ id: uuid(30), auth_type: 'none' });
      const request = captureBody('patch', `agents/mcp-servers/${uuid(30)}/`);
      renderWithProviders(<McpServers />, { companies: [owner] });

      await openEditModal(user);
      await user.selectOptions(await screen.findByLabelText('Autenticação'), 'Bearer token');
      await user.type(screen.getByLabelText('Token'), 'tok-novo');
      await user.click(screen.getByRole('button', { name: 'Salvar alterações' }));

      await waitFor(() => expect(request.body).toMatchObject({ auth: { type: 'bearer', token: 'tok-novo' } }));
    });
  });

  describe('testing the connection', () => {
    it('sends the creation payload and lists the tools', async () => {
      const user = userEvent.setup({ delay: null });
      server.use(http.get(api('agents/'), () => HttpResponse.json([crmAgent])));
      const request = captureBody('post', 'agents/mcp-servers/test/', buildMcpServerTestResult());
      renderWithProviders(<McpServers />, { companies: [owner] });

      await openCreateModal(user);
      await user.click(screen.getByRole('button', { name: 'Testar conexão' }));

      expect(await screen.findByRole('status')).toHaveTextContent('Conexão OK — tools: search_contacts, create_deal');
      expect(request.body).toMatchObject({ agent_id: crmAgent.id, url: 'https://mcp.acme.com/mcp', auth: { type: 'none' } });
    });

    it('shows why the connection failed', async () => {
      const user = userEvent.setup({ delay: null });
      server.use(
        http.get(api('agents/'), () => HttpResponse.json([crmAgent])),
        http.post(api('agents/mcp-servers/test/'), () =>
          HttpResponse.json(buildMcpServerTestResult({ ok: false, tools: [], error: 'O servidor respondeu 401.' })),
        ),
      );
      renderWithProviders(<McpServers />, { companies: [owner] });

      await openCreateModal(user);
      await user.click(screen.getByRole('button', { name: 'Testar conexão' }));

      expect(await screen.findByRole('alert')).toHaveTextContent('O servidor respondeu 401.');
    });

    it('asks for the secret before testing an edited server', async () => {
      const user = userEvent.setup({ delay: null });
      server.use(http.get(api('agents/'), () => HttpResponse.json([crmAgent])));
      givenSavedServer({ auth_type: 'bearer' });
      renderWithProviders(<McpServers />, { companies: [owner] });

      await openEditModal(user);
      await user.click(await screen.findByRole('button', { name: 'Testar conexão' }));

      expect(await screen.findByRole('alert')).toHaveTextContent('Informe a credencial para testar a conexão.');
    });
  });

  it('removes a server once confirmed', async () => {
    const user = userEvent.setup();
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    givenSavedServer({ id: uuid(30) });
    const removed = vi.fn();
    server.use(
      http.delete(api(`agents/mcp-servers/${uuid(30)}/`), () => {
        removed();
        return new HttpResponse(null, { status: 204 });
      }),
    );
    renderWithProviders(<McpServers />, { companies: [owner] });

    await user.click(await screen.findByRole('button', { name: 'Abrir menu de ações' }));
    await user.click(screen.getByRole('menuitem', { name: 'Remover' }));

    expect(await screen.findByText('Servidor MCP removido.')).toBeInTheDocument();
    expect(removed).toHaveBeenCalledOnce();
  });
});
