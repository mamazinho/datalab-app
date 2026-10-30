import { HttpResponse, http } from 'msw';
import { describe, expect, it } from 'vitest';
import { Route, Routes } from 'react-router-dom';
import { renderWithProviders, screen, waitFor } from '../../test/test-utils';
import { api } from '../../test/msw/handlers';
import { server } from '../../test/msw/server';
import { buildCompany, buildCurrentMembership, buildRoutePermission, uuid } from '../../test/factories';
import type { IRoutePermission, IUserCompany } from '../../services/datalab-api/usersResource';
import { IaLayout } from './ia-layout';

const company = buildCompany({ id: uuid(1) });
const asMember: IUserCompany = {
  ...company,
  membership: { ...company.membership, membership_role: 'member' },
};

const givenMemberPermissions = (permissions: IRoutePermission[]) => {
  server.use(
    http.get(api('memberships/current/'), () =>
      HttpResponse.json(buildCurrentMembership({ membership_role: 'member', route_permissions: permissions })),
    ),
  );
};

const renderLayout = (companies: IUserCompany[] = [company]) =>
  renderWithProviders(
    <Routes>
      <Route path="/ia" element={<IaLayout />}>
        <Route path="agentes" element={<h1>Conteúdo</h1>} />
      </Route>
    </Routes>,
    { route: '/ia/agentes', companies },
  );

describe('<IaLayout />', () => {
  it('shows every tab to the owner, with MCP after agents and usage last', async () => {
    renderLayout();

    expect(await screen.findByRole('link', { name: 'Conversas' })).toBeInTheDocument();
    expect(screen.getAllByRole('link').map((link) => link.textContent)).toEqual([
      'Conversas',
      'Agentes',
      'MCP',
      'Consumo',
    ]);
    expect(screen.getByRole('link', { name: 'MCP' })).toHaveAttribute('href', '/ia/mcp');
    expect(screen.getByRole('link', { name: 'Consumo' })).toHaveAttribute('href', '/ia/consumo');
  });

  it('marks the tab of the current route as active', async () => {
    renderLayout();

    expect(await screen.findByRole('link', { name: 'Agentes' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(screen.getByRole('link', { name: 'Conversas' })).not.toHaveAttribute('aria-current');
  });

  it('renders the section content below the tabs', async () => {
    renderLayout();

    expect(await screen.findByRole('heading', { name: 'Conteúdo' })).toBeInTheDocument();
  });

  it('hides the agents tab from a member who only has chat', async () => {
    givenMemberPermissions([buildRoutePermission({ tag: 'chat', method: 'GET', path: '/v1/chats/' })]);
    renderLayout([asMember]);

    expect(await screen.findByRole('link', { name: 'Conversas' })).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.queryByRole('link', { name: 'Agentes' })).not.toBeInTheDocument(),
    );
  });

  it('hides the chat tab from a member who only has agents', async () => {
    givenMemberPermissions([buildRoutePermission({ tag: 'agents', path: '/v1/agents/' })]);
    renderLayout([asMember]);

    expect(await screen.findByRole('link', { name: 'Agentes' })).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.queryByRole('link', { name: 'Conversas' })).not.toBeInTheDocument(),
    );
  });

  it('shows the MCP tab to a member who can list the MCP servers', async () => {
    givenMemberPermissions([
      buildRoutePermission({ tag: 'agents', method: 'GET', path: '/v1/agents/mcp-servers/' }),
    ]);
    renderLayout([asMember]);

    expect(await screen.findByRole('link', { name: 'MCP' })).toBeInTheDocument();
  });

  it('hides the MCP tab from a member with other agents permissions only', async () => {
    givenMemberPermissions([buildRoutePermission({ tag: 'agents', method: 'POST', path: '/v1/agents/' })]);
    renderLayout([asMember]);

    expect(await screen.findByRole('link', { name: 'Agentes' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'MCP' })).not.toBeInTheDocument();
  });

  it('shows the usage tab to a member who can see the usage report', async () => {
    givenMemberPermissions([buildRoutePermission({ tag: 'chat', method: 'GET', path: '/v1/chats/usage/' })]);
    renderLayout([asMember]);

    expect(await screen.findByRole('link', { name: 'Consumo' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Conversas' })).not.toBeInTheDocument();
  });

  it('hides the usage tab from a member who can only chat', async () => {
    givenMemberPermissions([buildRoutePermission({ tag: 'chat', method: 'GET', path: '/v1/chats/' })]);
    renderLayout([asMember]);

    expect(await screen.findByRole('link', { name: 'Conversas' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Consumo' })).not.toBeInTheDocument();
  });
});
