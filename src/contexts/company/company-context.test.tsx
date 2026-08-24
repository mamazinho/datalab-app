import { HttpResponse, http } from 'msw';
import { QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { ReactNode } from 'react';
import { api } from '../../test/msw/handlers';
import { server } from '../../test/msw/server';
import { buildCompany, buildCurrentMembership, buildRoutePermission, uuid } from '../../test/factories';
import { createTestQueryClient } from '../../test/test-utils';
import { AGENT_ROUTE_PERMISSIONS, COMPANY_ROUTE_PERMISSIONS } from '../../utils/route-permissions';
import type { ICurrentMembership } from '../../services/datalab-api/membershipsResource';
import type { IUserCompany } from '../../services/datalab-api/usersResource';
import { CompanyProvider } from './providers';
import { useCompanyContext, useCompanyPermissions } from './contexts';

const acme = buildCompany({ id: uuid(1), name: 'Acme' });
const globex = buildCompany({ id: uuid(2), name: 'Globex' });

const acmeAsMember = buildCompany({
  id: uuid(1),
  name: 'Acme',
  membership: { ...acme.membership, membership_role: 'member' },
});

const givenMembership = (membership: Partial<ICurrentMembership>) => {
  server.use(
    http.get(api('memberships/current/'), () =>
      HttpResponse.json(buildCurrentMembership(membership)),
    ),
  );
};

const renderCompanyContext = (companies: IUserCompany[] = [acme]) => {
  const queryClient = createTestQueryClient();
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <CompanyProvider companies={companies}>{children}</CompanyProvider>
    </QueryClientProvider>
  );

  return renderHook(() => ({ ...useCompanyContext(), ...useCompanyPermissions() }), { wrapper });
};

describe('CompanyProvider', () => {
  describe('company selection', () => {
    it('auto-selects when the user belongs to exactly one company', () => {
      const { result } = renderCompanyContext([acme]);

      expect(result.current.currentCompany?.name).toBe('Acme');
    });

    it('selects nothing when the user belongs to more than one', () => {
      const { result } = renderCompanyContext([acme, globex]);

      expect(result.current.currentCompany).toBeNull();
    });

    it('restores the company saved from a previous session', () => {
      localStorage.setItem('selectedCompanyId', globex.id);

      const { result } = renderCompanyContext([acme, globex]);

      expect(result.current.currentCompany?.name).toBe('Globex');
    });

    it('ignores a saved id that is not a valid uuid', () => {
      localStorage.setItem('selectedCompanyId', 'lixo');

      const { result } = renderCompanyContext([acme]);

      expect(result.current.currentCompany?.name).toBe('Acme');
    });

    it('falls back to the single company when the saved one is gone', () => {
      localStorage.setItem('selectedCompanyId', uuid(9));

      const { result } = renderCompanyContext([acme]);

      expect(result.current.currentCompany?.name).toBe('Acme');
    });

    it('persists the company chosen by the user', async () => {
      const { result } = renderCompanyContext([acme, globex]);

      result.current.setCurrentCompany(globex);

      await waitFor(() => expect(result.current.currentCompany?.name).toBe('Globex'));
      expect(localStorage.getItem('selectedCompanyId')).toBe(globex.id);
    });

    it('clears the selection, which sends the user back to the onboarding', async () => {
      const { result } = renderCompanyContext([acme, globex]);
      result.current.selectCompanyById(acme.id);
      await waitFor(() => expect(result.current.currentCompany?.name).toBe('Acme'));

      result.current.clearSelectedCompany();

      await waitFor(() => expect(result.current.currentCompany).toBeNull());
      expect(localStorage.getItem('selectedCompanyId')).toBeNull();
    });
  });

  describe('owner permissions', () => {
    it('grants everything without consulting the permission list', async () => {
      givenMembership({ membership_role: 'owner', permissions: [] });
      const { result } = renderCompanyContext();

      await waitFor(() => expect(result.current.isOwner).toBe(true));
      expect(result.current.hasPermissionByTag('agents')).toBe(true);
      expect(result.current.hasPermissionByRoute(AGENT_ROUTE_PERMISSIONS.create)).toBe(true);
      expect(result.current.hasProviderPermission('ga4_property_create')).toBe(true);
      expect(result.current.hasAnyAgentsPermission).toBe(true);
      expect(result.current.hasAnyCompanyPermission).toBe(true);
      expect(result.current.canManageUsers).toBe(true);
    });
  });

  describe('member permissions', () => {
    it('grants only what was explicitly given', async () => {
      givenMembership({
        membership_role: 'member',
        permissions: [buildRoutePermission({ method: 'POST', path: '/v1/agents/', tag: 'agents' })],
      });
      const { result } = renderCompanyContext([acmeAsMember]);

      await waitFor(() => expect(result.current.memberPermissions).toHaveLength(1));
      expect(result.current.hasPermissionByRoute(AGENT_ROUTE_PERMISSIONS.create)).toBe(true);
      expect(result.current.hasPermissionByRoute(AGENT_ROUTE_PERMISSIONS.remove)).toBe(false);
      expect(result.current.hasPermissionByTag('agents')).toBe(true);
      expect(result.current.hasPermissionByTag('companies')).toBe(false);
      expect(result.current.isOwner).toBe(false);
      expect(result.current.canManageUsers).toBe(false);
    });

    it('exposes company management only with an explicit company permission', async () => {
      givenMembership({
        membership_role: 'member',
        permissions: [buildRoutePermission({ method: 'PATCH', path: '/v1/companies/{id}/', tag: 'companies' })],
      });
      const { result } = renderCompanyContext([acmeAsMember]);

      await waitFor(() => expect(result.current.hasAnyCompanyPermission).toBe(true));
      expect(result.current.hasPermissionByRoute(COMPANY_ROUTE_PERMISSIONS.update)).toBe(true);
      expect(result.current.hasAnyAgentsPermission).toBe(false);
    });

    it('flattens the provider permissions that come keyed by provider', async () => {
      givenMembership({
        membership_role: 'member',
        provider_permissions: {
          google: [
            {
              id: uuid(4),
              key: 'ga4_property_create',
              provider: 'google',
              name: 'Criar property',
              description: '',
              created_at: '2026-01-01T00:00:00Z',
              updated_at: '2026-01-01T00:00:00Z',
            },
          ],
        },
      });
      const { result } = renderCompanyContext([acmeAsMember]);

      await waitFor(() => expect(result.current.providerPermissions).toHaveLength(1));
      expect(result.current.hasProviderPermission('ga4_property_create')).toBe(true);
      expect(result.current.hasProviderPermission('ga4_account_create')).toBe(false);
    });

    it('survives a malformed permission instead of blanking the app', async () => {
      givenMembership({
        membership_role: 'member',
        permissions: [
          null,
          { name: 'sem method nem path' },
          buildRoutePermission({ method: 'POST', path: '/v1/agents/' }),
        ] as never,
      });
      const { result } = renderCompanyContext([acmeAsMember]);

      await waitFor(() => expect(result.current.memberPermissions).toHaveLength(1));
      expect(result.current.hasPermissionByRoute(AGENT_ROUTE_PERMISSIONS.create)).toBe(true);
    });

    it('answers from the embedded role while the authoritative membership loads', async () => {
      givenMembership({
        membership_role: 'member',
        permissions: [buildRoutePermission({ method: 'POST', path: '/v1/agents/', tag: 'agents' })],
      });
      const { result } = renderCompanyContext([acmeAsMember]);

      expect(result.current.currentMembership?.membership_role).toBe('member');
      expect(result.current.hasPermissionByTag('agents')).toBe(false);

      await waitFor(() => expect(result.current.hasPermissionByTag('agents')).toBe(true));
    });

    it('denies everything while no company is selected', () => {
      const { result } = renderCompanyContext([acme, globex]);

      expect(result.current.currentMembership).toBeNull();
      expect(result.current.hasPermissionByTag('agents')).toBe(false);
      expect(result.current.hasProviderPermission('ga4_property_create')).toBe(false);
      expect(result.current.hasAnyAgentsPermission).toBe(false);
    });
  });

  it('exposes the company asset allowlist that comes with the membership', async () => {
    givenMembership({
      company: {
        id: uuid(1),
        name: 'Acme',
        status: 'active',
        created_by_user_id: uuid(3),
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z',
        provider_assets: [
          {
            id: uuid(5),
            provider: 'google',
            company_id: uuid(1),
            asset_type: 'ga4_property',
            external_id: 'prop-1',
            name: 'Site',
            parent_name: 'Acme',
            extra: {},
            created_at: '2026-01-01T00:00:00Z',
            updated_at: '2026-01-01T00:00:00Z',
          },
        ],
      },
    });
    const { result } = renderCompanyContext();

    await waitFor(() => expect(result.current.companyProviderAssets).toHaveLength(1));
    expect(result.current.companyProviderAssets[0].name).toBe('Site');
  });
});
