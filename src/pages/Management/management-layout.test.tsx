import { HttpResponse, http } from 'msw';
import { describe, expect, it } from 'vitest';
import { renderWithProviders, screen } from '../../test/test-utils';
import { api } from '../../test/msw/handlers';
import { server } from '../../test/msw/server';
import { buildCompany, buildCurrentMembership, buildRoutePermission } from '../../test/factories';
import type { IRoutePermission, IUserCompany } from '../../services/datalab-api/usersResource';
import { ManagementLayout } from './management-layout';

const company = buildCompany();
const asMember: IUserCompany = { ...company, membership: { ...company.membership, membership_role: 'member' } };

const renderAsMemberWith = (permissions: IRoutePermission[]) => {
  server.use(
    http.get(api('memberships/current/'), () =>
      HttpResponse.json(buildCurrentMembership({ membership_role: 'member', route_permissions: permissions })),
    ),
  );
  renderWithProviders(<ManagementLayout />, { companies: [asMember] });
};

describe('<ManagementLayout />', () => {
  it('shows the members tab to a member granted the member routes the sync tags as memberships', async () => {
    renderAsMemberWith([buildRoutePermission({ method: 'GET', path: '/v1/memberships/members/', tag: 'memberships' })]);

    expect(await screen.findByRole('link', { name: 'Membros' })).toBeInTheDocument();
  });

  it('hides the members tab from a member without any member route', async () => {
    renderAsMemberWith([buildRoutePermission({ method: 'GET', path: '/v1/chats/', tag: 'chat' })]);

    expect(await screen.findByRole('link', { name: 'Integrações' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Membros' })).not.toBeInTheDocument();
  });
});
