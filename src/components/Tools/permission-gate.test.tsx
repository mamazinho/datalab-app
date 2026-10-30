import { HttpResponse, http } from 'msw';
import { describe, expect, it } from 'vitest';
import { renderWithProviders, screen } from '../../test/test-utils';
import { api } from '../../test/msw/handlers';
import { server } from '../../test/msw/server';
import { buildCompany, buildCurrentMembership, buildRoutePermission } from '../../test/factories';
import type { IRoutePermission, IUserCompany } from '../../services/datalab-api/usersResource';
import { PermissionGate } from './permission-gate';

const company = buildCompany();
const asMember: IUserCompany = { ...company, membership: { ...company.membership, membership_role: 'member' } };

const CREATE_AGENT = { method: 'POST', path: 'agents/' };
const REMOVE_AGENT = { method: 'DELETE', path: 'agents/{agent_id}/' };

const givenMemberWith = (permissions: IRoutePermission[]) => {
  server.use(
    http.get(api('memberships/current/'), () =>
      HttpResponse.json(buildCurrentMembership({ membership_role: 'member', route_permissions: permissions })),
    ),
  );
};

const renderGate = (route: typeof CREATE_AGENT | (typeof CREATE_AGENT)[], companies = [asMember]) =>
  renderWithProviders(
    <>
      <PermissionGate route={route}>
        <button>Ação protegida</button>
      </PermissionGate>
      <p>Página carregada</p>
    </>,
    { companies },
  );

describe('<PermissionGate />', () => {
  it('shows the children to the owner without any grant', async () => {
    renderGate(CREATE_AGENT, [company]);

    expect(await screen.findByRole('button', { name: 'Ação protegida' })).toBeInTheDocument();
  });

  it('shows the children to a member granted the route', async () => {
    givenMemberWith([buildRoutePermission({ method: 'POST', path: '/v1/agents/' })]);
    renderGate(CREATE_AGENT);

    expect(await screen.findByRole('button', { name: 'Ação protegida' })).toBeInTheDocument();
  });

  it('hides the children from a member without the route', async () => {
    givenMemberWith([buildRoutePermission({ method: 'GET', path: '/v1/chats/' })]);
    renderGate(CREATE_AGENT);

    expect(await screen.findByText('Página carregada')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Ação protegida' })).not.toBeInTheDocument();
  });

  it('shows the children when the member has any route of a list', async () => {
    givenMemberWith([buildRoutePermission({ method: 'DELETE', path: '/v1/agents/{agent_id}/' })]);
    renderGate([CREATE_AGENT, REMOVE_AGENT]);

    expect(await screen.findByRole('button', { name: 'Ação protegida' })).toBeInTheDocument();
  });
});
