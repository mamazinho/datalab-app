import { HttpResponse, http } from 'msw';
import { describe, expect, it } from 'vitest';
import { renderWithProviders, screen, userEvent, waitFor } from '../../../test/test-utils';
import { ACCESS_TOKEN, api } from '../../../test/msw/handlers';
import { server } from '../../../test/msw/server';
import { buildCompany, buildInvite, buildUser, uuid } from '../../../test/factories';
import type { IUserInvite } from '../../../services/datalab-api/usersResource';
import { InvitesMenu } from './invites-menu';

type User = ReturnType<typeof userEvent.setup>;

const givenInvites = (invites: IUserInvite[]) => {
  localStorage.setItem('accessToken', ACCESS_TOKEN);
  server.use(http.get(api('users/me'), () => HttpResponse.json(buildUser({ invites }))));
};

const pendingInvite = buildInvite({
  id: uuid(7),
  status: 'pending',
  company: buildCompany({ name: 'Acme' }),
});

const openMenu = async (user: User) => {
  await user.click(await screen.findByRole('button', { name: /Convites/ }));
};

describe('<InvitesMenu />', () => {
  it('badges how many invites are waiting', async () => {
    givenInvites([pendingInvite, buildInvite({ id: uuid(8), status: 'accepted' })]);
    renderWithProviders(<InvitesMenu />);

    expect(await screen.findByRole('button', { name: /Convites 1/ })).toBeInTheDocument();
  });

  it('shows no badge when nothing is pending', async () => {
    givenInvites([buildInvite({ status: 'accepted' })]);
    renderWithProviders(<InvitesMenu />);

    await waitFor(() =>
      expect(screen.queryByRole('button', { name: /Convites 1/ })).not.toBeInTheDocument(),
    );
  });

  it('keeps the panel closed until asked', async () => {
    givenInvites([pendingInvite]);
    renderWithProviders(<InvitesMenu />);

    await screen.findByRole('button', { name: /Convites/ });
    expect(screen.queryByRole('button', { name: 'Aceitar' })).not.toBeInTheDocument();
  });

  it('lists pending invites with the actions', async () => {
    const user = userEvent.setup();
    givenInvites([pendingInvite]);
    renderWithProviders(<InvitesMenu />);
    await openMenu(user);

    expect(screen.getByText('Acme')).toBeInTheDocument();
    expect(screen.getByText('Por Carla Dias')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Aceitar' })).toBeInTheDocument();
  });

  it('switches tabs and drops the actions on settled invites', async () => {
    const user = userEvent.setup();
    givenInvites([buildInvite({ id: uuid(8), status: 'accepted', company: buildCompany({ name: 'Globex' }) })]);
    renderWithProviders(<InvitesMenu />);
    await openMenu(user);

    expect(screen.getByText('Nenhum convite aqui.')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Aceitos' }));

    expect(screen.getByText('Globex')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Aceitar' })).not.toBeInTheDocument();
  });

  it('accepts an invite from the header', async () => {
    const user = userEvent.setup();
    let acceptedId: string | undefined;
    givenInvites([pendingInvite]);
    server.use(
      http.post(api('users/me/invites/:inviteId/accept'), ({ params }) => {
        acceptedId = params.inviteId as string;
        return HttpResponse.json(buildInvite({ status: 'accepted' }));
      }),
    );
    renderWithProviders(<InvitesMenu />);
    await openMenu(user);

    await user.click(screen.getByRole('button', { name: 'Aceitar' }));

    expect(await screen.findByText('Convite aceito!')).toBeInTheDocument();
    expect(acceptedId).toBe(pendingInvite.id);
  });

  it('declines an invite from the header', async () => {
    const user = userEvent.setup();
    let declinedId: string | undefined;
    givenInvites([pendingInvite]);
    server.use(
      http.post(api('users/me/invites/:inviteId/decline'), ({ params }) => {
        declinedId = params.inviteId as string;
        return HttpResponse.json(buildInvite({ status: 'declined' }));
      }),
    );
    renderWithProviders(<InvitesMenu />);
    await openMenu(user);

    await user.click(screen.getByRole('button', { name: 'Recusar' }));

    expect(await screen.findByText('Convite recusado.')).toBeInTheDocument();
    expect(declinedId).toBe(pendingInvite.id);
  });

  it('falls back to ids and a generic sender when the payload is incomplete', async () => {
    const user = userEvent.setup();
    givenInvites([buildInvite({ company: null, invited_by: null })]);
    renderWithProviders(<InvitesMenu />);
    await openMenu(user);

    expect(screen.getByText(`Empresa #${uuid(1)}`)).toBeInTheDocument();
    expect(screen.getByText('Por alguém')).toBeInTheDocument();
  });
});
