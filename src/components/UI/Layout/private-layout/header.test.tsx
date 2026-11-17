import { HttpResponse, http } from 'msw';
import { describe, expect, it } from 'vitest';
import { renderWithProviders, screen, userEvent } from '../../../../test/test-utils';
import { ACCESS_TOKEN, api } from '../../../../test/msw/handlers';
import { server } from '../../../../test/msw/server';
import { buildCompany, buildCurrentMembership, buildRoutePermission, buildUser, uuid } from '../../../../test/factories';
import type { IRoutePermission, IUserCompany } from '../../../../services/datalab-api/usersResource';
import { Header } from './header';

const company = buildCompany({ id: uuid(1), name: 'Acme' });
const asMember: IUserCompany = { ...company, membership: { ...company.membership, membership_role: 'member' } };

const renderHeader = (companies: IUserCompany[] = [company]) => {
  localStorage.setItem('accessToken', ACCESS_TOKEN);
  server.use(http.get(api('users/me'), () => HttpResponse.json(buildUser({ name: 'Ana Souza', companies }))));
  return renderWithProviders(<Header />, { companies });
};

const givenMemberPermissions = (permissions: IRoutePermission[]) => {
  server.use(
    http.get(api('memberships/current/'), () =>
      HttpResponse.json(buildCurrentMembership({ membership_role: 'member', route_permissions: permissions })),
    ),
  );
};

describe('<Header />', () => {
  it('closes the profile menu when the company dropdown opens', async () => {
    const user = userEvent.setup();
    renderHeader();

    await user.click(await screen.findByRole('button', { name: /Foto de perfil de Ana Souza/ }));
    expect(screen.getByRole('link', { name: 'Editar perfil' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Acme' }));

    expect(screen.queryByRole('link', { name: 'Editar perfil' })).not.toBeInTheDocument();
    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });

  it('closes the profile menu on a click outside it', async () => {
    const user = userEvent.setup();
    renderHeader();

    await user.click(await screen.findByRole('button', { name: /Foto de perfil de Ana Souza/ }));
    await user.click(screen.getByRole('link', { name: 'Página inicial' }));

    expect(screen.queryByRole('link', { name: 'Editar perfil' })).not.toBeInTheDocument();
  });

  it("hides Trackin' Master from a member without any tracking route", async () => {
    givenMemberPermissions([buildRoutePermission({ tag: 'agents' })]);
    renderHeader([asMember]);

    expect(await screen.findByRole('link', { name: 'IA' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: "Trackin' Master" })).not.toBeInTheDocument();
  });

  it("shows Trackin' Master to a member granted a tracking route", async () => {
    givenMemberPermissions([buildRoutePermission({ method: 'POST', path: '/v1/tracking/scan/', tag: 'tracking' })]);
    renderHeader([asMember]);

    expect(await screen.findByRole('link', { name: "Trackin' Master" })).toBeInTheDocument();
  });
});
