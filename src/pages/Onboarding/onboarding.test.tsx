import { HttpResponse, http } from 'msw';
import { beforeEach, describe, expect, it } from 'vitest';
import { Route, Routes } from 'react-router-dom';
import { renderWithProviders, screen, userEvent, waitFor } from '../../test/test-utils';
import { ACCESS_TOKEN, api } from '../../test/msw/handlers';
import { server } from '../../test/msw/server';
import { buildCompany, buildInvite, buildUser, uuid } from '../../test/factories';
import type { IUserResponse } from '../../services/datalab-api/usersResource';
import { Onboarding } from './onboarding';

const givenLoggedUser = (me: Partial<IUserResponse>) => {
  localStorage.setItem('accessToken', ACCESS_TOKEN);
  server.use(http.get(api('users/me'), () => HttpResponse.json(buildUser(me))));
};

const renderOnboarding = () =>
  renderWithProviders(
    <Routes>
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="/" element={<h1>Home</h1>} />
    </Routes>,
    { route: '/onboarding' },
  );

describe('<Onboarding />', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('user without a company', () => {
    it('invites the user to create one and reports having no invites', async () => {
      givenLoggedUser({ companies: [], invites: [] });
      renderOnboarding();

      expect(await screen.findByText('Bem-vindo ao DataLab')).toBeInTheDocument();
      expect(screen.getByText(/0 convite\(s\) pendente\(s\)/)).toBeInTheDocument();
    });

    it('creates the company and lands on home', async () => {
      const user = userEvent.setup();
      let body: unknown;
      givenLoggedUser({ companies: [], invites: [] });
      server.use(
        http.post(api('companies/'), async ({ request }) => {
          body = await request.json();
          const company = buildCompany({ name: 'Acme' });
          return HttpResponse.json(
            { company: { ...company, created_by_user_id: uuid(3) }, membership: company.membership },
            { status: 201 },
          );
        }),
      );
      renderOnboarding();

      await user.type(await screen.findByLabelText('Nome da empresa'), 'Acme');
      await user.click(screen.getByRole('button', { name: 'Criar empresa' }));

      expect(await screen.findByRole('heading', { name: 'Home' })).toBeInTheDocument();
      expect(body).toEqual({ name: 'Acme' });
      expect(localStorage.getItem('selectedCompanyId')).toBe(uuid(1));
    });

    it('shows the failure inline and stays on the onboarding', async () => {
      const user = userEvent.setup();
      givenLoggedUser({ companies: [], invites: [] });
      server.use(
        http.post(api('companies/'), () =>
          HttpResponse.json({ detail: 'Nome de empresa já existe.' }, { status: 409 }),
        ),
      );
      renderOnboarding();

      await user.type(await screen.findByLabelText('Nome da empresa'), 'Acme');
      await user.click(screen.getByRole('button', { name: 'Criar empresa' }));

      expect(await screen.findByText(/Nome de empresa já existe\./)).toBeInTheDocument();
      expect(screen.queryByRole('heading', { name: 'Home' })).not.toBeInTheDocument();
    });
  });

  describe('pending invites', () => {
    const invite = buildInvite({ company: buildCompany({ name: 'Acme' }) });

    it('lists who invited the user and to which company', async () => {
      givenLoggedUser({ companies: [], invites: [invite] });
      renderOnboarding();

      expect(await screen.findByText('Acme')).toBeInTheDocument();
      expect(screen.getByText('Convidado por Carla Dias')).toBeInTheDocument();
      expect(screen.getByText(/1 convite\(s\) pendente\(s\)/)).toBeInTheDocument();
    });

    it('accepts an invite and refreshes the user', async () => {
      const user = userEvent.setup();
      let acceptedId: string | undefined;
      givenLoggedUser({ companies: [], invites: [invite] });
      server.use(
        http.post(api('users/me/invites/:inviteId/accept'), ({ params }) => {
          acceptedId = params.inviteId as string;
          return HttpResponse.json(buildInvite({ status: 'accepted' }));
        }),
      );
      renderOnboarding();

      await user.click(await screen.findByRole('button', { name: 'Aceitar' }));

      expect(await screen.findByText('Convite aceito!')).toBeInTheDocument();
      expect(acceptedId).toBe(invite.id);
    });

    it('declines an invite', async () => {
      const user = userEvent.setup();
      let declinedId: string | undefined;
      givenLoggedUser({ companies: [], invites: [invite] });
      server.use(
        http.post(api('users/me/invites/:inviteId/decline'), ({ params }) => {
          declinedId = params.inviteId as string;
          return HttpResponse.json(buildInvite({ status: 'declined' }));
        }),
      );
      renderOnboarding();

      await user.click(await screen.findByRole('button', { name: 'Recusar' }));

      expect(await screen.findByText('Convite recusado.')).toBeInTheDocument();
      expect(declinedId).toBe(invite.id);
    });

    it('hides invites that are no longer pending', async () => {
      givenLoggedUser({ companies: [], invites: [buildInvite({ status: 'declined' })] });
      renderOnboarding();

      expect(await screen.findByText(/0 convite\(s\) pendente\(s\)/)).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Aceitar' })).not.toBeInTheDocument();
    });
  });

  describe('user in more than one company', () => {
    const companies = [
      buildCompany({ id: uuid(1), name: 'Acme' }),
      buildCompany({ id: uuid(2), name: 'Globex' }),
    ];

    it('asks which company to continue with', async () => {
      givenLoggedUser({ companies });
      renderOnboarding();

      expect(await screen.findByText('Selecione sua empresa')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Acme/ })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Globex/ })).toBeInTheDocument();
    });

    it('remembers the chosen company and goes home', async () => {
      const user = userEvent.setup();
      givenLoggedUser({ companies });
      renderOnboarding();

      await user.click(await screen.findByRole('button', { name: /Globex/ }));

      expect(await screen.findByRole('heading', { name: 'Home' })).toBeInTheDocument();
      await waitFor(() => expect(localStorage.getItem('selectedCompanyId')).toBe(uuid(2)));
    });
  });
});
