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
      HttpResponse.json(buildCurrentMembership({ membership_role: 'member', permissions })),
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
  it('shows both tabs to the owner', async () => {
    renderLayout();

    expect(await screen.findByRole('link', { name: 'Conversas' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Agentes' })).toBeInTheDocument();
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
    givenMemberPermissions([buildRoutePermission({ tag: 'chat', path: '/v1/chats/' })]);
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
});
