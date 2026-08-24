import { HttpResponse, http } from 'msw';
import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders, screen, userEvent, waitFor } from '../../test/test-utils';
import { api } from '../../test/msw/handlers';
import { server } from '../../test/msw/server';
import { buildCompany, buildCurrentMembership, uuid } from '../../test/factories';
import type { IIntegrationStatus } from '../../services/datalab-api/authResource';
import type { ICompanyProviderAsset } from '../../services/datalab-api/companiesResource';
import type { IUserCompany } from '../../services/datalab-api/usersResource';
import { Integrations } from './integrations';

type User = ReturnType<typeof userEvent.setup>;

const company = buildCompany({ id: uuid(1), name: 'Acme' });
const asMember: IUserCompany = {
  ...company,
  membership: { ...company.membership, membership_role: 'member' },
};

const buildIntegration = (overrides: Partial<IIntegrationStatus> = {}): IIntegrationStatus => ({
  key: 'google_analytics',
  provider: 'google',
  label: 'Google Analytics',
  description: 'Relatórios do GA4',
  is_login: false,
  scopes: ['https://www.googleapis.com/auth/analytics.readonly'],
  connected: false,
  missing_scopes: [],
  token_expires_at: null,
  connected_account_email: null,
  ...overrides,
});

const buildAsset = (overrides: Partial<ICompanyProviderAsset> = {}): ICompanyProviderAsset => ({
  id: uuid(5),
  provider: 'google',
  company_id: uuid(1),
  asset_type: 'ga4_property',
  external_id: 'prop-1',
  name: 'Site institucional',
  parent_name: 'Acme',
  extra: {},
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
  ...overrides,
});

const givenIntegrations = (integrations: IIntegrationStatus[]) => {
  server.use(http.get(api('auth/integrations/'), () => HttpResponse.json(integrations)));
};

const givenCompanyAssets = (assets: ICompanyProviderAsset[], role: 'owner' | 'member' = 'owner') => {
  server.use(
    http.get(api('memberships/current/'), () =>
      HttpResponse.json(
        buildCurrentMembership({
          membership_role: role,
          company: {
            id: uuid(1),
            name: 'Acme',
            status: 'active',
            created_by_user_id: uuid(3),
            created_at: '2026-01-01T00:00:00Z',
            updated_at: '2026-01-01T00:00:00Z',
            provider_assets: assets,
          },
        }),
      ),
    ),
  );
};

const renderIntegrations = (companies: IUserCompany[] = [company], route = '/integracoes') =>
  renderWithProviders(<Integrations />, { companies, route });

const acceptConfirm = () => vi.spyOn(window, 'confirm').mockReturnValue(true);

describe('<Integrations />', () => {
  it('renders nothing while no company is selected', () => {
    renderIntegrations([company, buildCompany({ id: uuid(2), name: 'Globex' })]);

    expect(screen.queryByText('Integrações')).not.toBeInTheDocument();
  });

  it('lists the connectable integrations and hides the login ones', async () => {
    givenIntegrations([
      buildIntegration({ key: 'google_analytics', label: 'Google Analytics' }),
      buildIntegration({ key: 'google_login', label: 'Login com Google', is_login: true }),
    ]);
    renderIntegrations();

    expect(await screen.findByText('Google Analytics')).toBeInTheDocument();
    expect(screen.queryByText('Login com Google')).not.toBeInTheDocument();
  });

  it('shows an empty state when nothing can be connected', async () => {
    givenIntegrations([buildIntegration({ is_login: true })]);
    renderIntegrations();

    expect(await screen.findByText('Nenhuma integração disponível no momento.')).toBeInTheDocument();
  });

  describe('status', () => {
    it('marks an integration that was never connected', async () => {
      givenIntegrations([buildIntegration({ connected: false })]);
      renderIntegrations();

      expect(await screen.findByText('Não conectado')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Conectar' })).toBeInTheDocument();
    });

    it('shows the connected account and offers reconnecting', async () => {
      givenIntegrations([
        buildIntegration({
          connected: true,
          connected_account_email: 'ana@datalab.com',
          token_expires_at: '2030-01-01T00:00:00Z',
        }),
      ]);
      renderIntegrations();

      expect(await screen.findByText('Conectado')).toBeInTheDocument();
      expect(screen.getByText('ana@datalab.com')).toBeInTheDocument();
      expect(screen.getByText('Válido até:')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Reconectar' })).toBeInTheDocument();
    });

    it('warns about an expired token', async () => {
      givenIntegrations([
        buildIntegration({ connected: true, token_expires_at: '2020-01-01T00:00:00Z' }),
      ]);
      renderIntegrations();

      expect(await screen.findByText('Token expirado')).toBeInTheDocument();
      expect(screen.getByText('Expirou em:')).toBeInTheDocument();
    });

    it('asks for the missing scopes when the grant is partial', async () => {
      givenIntegrations([
        buildIntegration({
          connected: true,
          missing_scopes: ['https://www.googleapis.com/auth/analytics.edit'],
        }),
      ]);
      renderIntegrations();

      expect(await screen.findByText('Permissões incompletas')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Completar permissões' })).toBeInTheDocument();
    });
  });

  describe('company assets', () => {
    it('lists which assets of the integration belong to the company', async () => {
      givenIntegrations([buildIntegration({ connected: true })]);
      givenCompanyAssets([buildAsset({ name: 'Site institucional' })]);
      renderIntegrations();

      expect(await screen.findByText('Ativos da empresa (1)')).toBeInTheDocument();
      expect(screen.getByText('Site institucional')).toBeInTheDocument();
    });

    it('does not mix assets from another integration of the same provider', async () => {
      givenIntegrations([buildIntegration({ key: 'google_analytics', connected: true })]);
      givenCompanyAssets([
        buildAsset({ asset_type: 'google_ads_customer', name: 'Conta de anúncios' }),
      ]);
      renderIntegrations();

      await screen.findByText('Conectado');
      expect(screen.queryByText('Conta de anúncios')).not.toBeInTheDocument();
    });

    it('offers asset management to the owner only', async () => {
      givenIntegrations([buildIntegration({ connected: true })]);
      renderIntegrations();

      expect(await screen.findByRole('button', { name: 'Gerenciar permissões' })).toBeInTheDocument();
    });

    it('hides asset management from a member', async () => {
      givenIntegrations([buildIntegration({ connected: true })]);
      givenCompanyAssets([], 'member');
      renderIntegrations([asMember]);

      await screen.findByText('Conectado');
      await waitFor(() =>
        expect(screen.queryByRole('button', { name: 'Gerenciar permissões' })).not.toBeInTheDocument(),
      );
    });
  });

  describe('connecting', () => {
    it('opens the provider consent window with the URL from the backend', async () => {
      const user = userEvent.setup();
      const open = vi.spyOn(window, 'open').mockReturnValue({} as Window);
      givenIntegrations([buildIntegration()]);
      server.use(
        http.get(api('auth/google/authorize/'), ({ request }) => {
          const integration = new URL(request.url).searchParams.get('integration');
          return HttpResponse.json({ authorization_url: `https://consent.google/${integration}` });
        }),
      );
      renderIntegrations();

      await user.click(await screen.findByRole('button', { name: 'Conectar' }));

      await waitFor(() =>
        expect(open).toHaveBeenCalledWith(
          'https://consent.google/google_analytics',
          'google_integration_popup',
          expect.any(String),
        ),
      );
    });

    it('tells the user to allow pop-ups when the window is blocked', async () => {
      const user = userEvent.setup();
      vi.spyOn(window, 'open').mockReturnValue(null);
      givenIntegrations([buildIntegration()]);
      server.use(
        http.get(api('auth/google/authorize/'), () =>
          HttpResponse.json({ authorization_url: 'https://consent.google' }),
        ),
      );
      renderIntegrations();

      await user.click(await screen.findByRole('button', { name: 'Conectar' }));

      expect(await screen.findByText(/Permita janelas pop-up/)).toBeInTheDocument();
    });

    it('reports a failure to start the consent flow', async () => {
      const user = userEvent.setup();
      givenIntegrations([buildIntegration()]);
      server.use(
        http.get(api('auth/google/authorize/'), () =>
          HttpResponse.json({ detail: 'Integração indisponível.' }, { status: 503 }),
        ),
      );
      renderIntegrations();

      await user.click(await screen.findByRole('button', { name: 'Conectar' }));

      expect(await screen.findByText('Integração indisponível.')).toBeInTheDocument();
    });
  });

  describe('disconnecting', () => {
    const openDisconnect = async (user: User) => {
      await user.click(await screen.findByRole('button', { name: 'Desconectar' }));
    };

    it('warns that the whole provider goes away before disconnecting', async () => {
      const user = userEvent.setup();
      const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false);
      let called = false;
      givenIntegrations([
        buildIntegration({ key: 'google_analytics', label: 'Google Analytics', connected: true }),
        buildIntegration({ key: 'google_ads', label: 'Google Ads', connected: true }),
      ]);
      server.use(
        http.delete(api('auth/google/connection/'), () => {
          called = true;
          return new HttpResponse(null, { status: 204 });
        }),
      );
      renderIntegrations();

      const [firstCard] = await screen.findAllByRole('button', { name: 'Desconectar' });
      await user.click(firstCard);

      expect(confirm.mock.calls[0][0]).toContain('Google Analytics, Google Ads');
      await waitFor(() => expect(called).toBe(false));
    });

    it('disconnects the provider once confirmed', async () => {
      const user = userEvent.setup();
      acceptConfirm();
      let called = false;
      givenIntegrations([buildIntegration({ connected: true })]);
      server.use(
        http.delete(api('auth/google/connection/'), () => {
          called = true;
          return new HttpResponse(null, { status: 204 });
        }),
      );
      renderIntegrations();

      await openDisconnect(user);

      expect(await screen.findByText('Conta Google desconectada.')).toBeInTheDocument();
      expect(called).toBe(true);
    });

    it('treats an already removed connection as success', async () => {
      const user = userEvent.setup();
      acceptConfirm();
      givenIntegrations([buildIntegration({ connected: true })]);
      server.use(
        http.delete(api('auth/google/connection/'), () => new HttpResponse(null, { status: 404 })),
      );
      renderIntegrations();

      await openDisconnect(user);

      expect(await screen.findByText('Conta Google desconectada.')).toBeInTheDocument();
    });

    it('reports any other failure', async () => {
      const user = userEvent.setup();
      acceptConfirm();
      givenIntegrations([buildIntegration({ connected: true })]);
      server.use(
        http.delete(api('auth/google/connection/'), () =>
          HttpResponse.json({ detail: 'Provider fora do ar.' }, { status: 502 }),
        ),
      );
      renderIntegrations();

      await openDisconnect(user);

      expect(await screen.findByText('Provider fora do ar.')).toBeInTheDocument();
    });
  });
});
