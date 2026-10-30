import { HttpResponse, http } from 'msw';
import { describe, expect, it } from 'vitest';
import { Route, Routes } from 'react-router-dom';
import type { ReactElement } from 'react';
import { renderWithProviders, screen } from '../test/test-utils';
import { ACCESS_TOKEN, api } from '../test/msw/handlers';
import { server } from '../test/msw/server';
import {
  buildCompany,
  buildCurrentMembership,
  buildRoutePermission,
  buildUser,
  uuid,
} from '../test/factories';
import type { IRoutePermission, IUserCompany } from '../services/datalab-api/usersResource';
import { COMPANY_ROUTE_PERMISSIONS, MCP_SERVER_ROUTE_PERMISSIONS } from '../utils/route-permissions';
import {
  IaIndexRedirect,
  RoutePermissionRoute,
  OnboardingRoute,
  PermissionRoute,
  PrivateRoutes,
  PublicRoutes,
  RedirectLegacyChatMessages,
} from './wrappers';

const company = buildCompany({ id: uuid(1), name: 'Acme' });
const asMember: IUserCompany = {
  ...company,
  membership: { ...company.membership, membership_role: 'member' },
};

const givenSession = (companies: IUserCompany[] = [company]) => {
  localStorage.setItem('accessToken', ACCESS_TOKEN);
  server.use(http.get(api('users/me'), () => HttpResponse.json(buildUser({ companies }))));
};

const givenMemberPermissions = (permissions: IRoutePermission[]) => {
  server.use(
    http.get(api('memberships/current/'), () =>
      HttpResponse.json(buildCurrentMembership({ membership_role: 'member', route_permissions: permissions })),
    ),
  );
};

const renderRoutes = (routes: ReactElement, options: { route: string; companies?: IUserCompany[] }) =>
  renderWithProviders(
    <Routes>
      {routes}
      <Route path="/login" element={<h1>Login</h1>} />
      <Route path="/onboarding" element={<h1>Onboarding</h1>} />
      <Route path="/" element={<h1>Home</h1>} />
      <Route path="/ia/conversas" element={<h1>Conversas</h1>} />
      <Route path="/ia/agentes" element={<h1>Agentes</h1>} />
      <Route path="/ia/consumo" element={<h1>Consumo</h1>} />
      <Route path="/ia/conversas/:chatId/mensagens" element={<h1>Mensagens</h1>} />
    </Routes>,
    { route: options.route, companies: options.companies ?? [company] },
  );

describe('PrivateRoutes', () => {
  it('sends an anonymous visitor to login', () => {
    renderRoutes(
      <Route element={<PrivateRoutes />}>
        <Route path="/privado" element={<h1>Privado</h1>} />
      </Route>,
      { route: '/privado' },
    );

    expect(screen.getByRole('heading', { name: 'Login' })).toBeInTheDocument();
  });

  it('renders the private area once the user is loaded', async () => {
    givenSession();
    renderRoutes(
      <Route element={<PrivateRoutes />}>
        <Route path="/privado" element={<h1>Privado</h1>} />
      </Route>,
      { route: '/privado' },
    );

    expect(await screen.findByRole('heading', { name: 'Privado' })).toBeInTheDocument();
  });

  it('sends a user with no company to the onboarding', async () => {
    givenSession([]);
    renderRoutes(
      <Route element={<PrivateRoutes />}>
        <Route path="/privado" element={<h1>Privado</h1>} />
      </Route>,
      { route: '/privado', companies: [] },
    );

    expect(await screen.findByRole('heading', { name: 'Onboarding' })).toBeInTheDocument();
  });

  it('shows the error screen instead of the onboarding when the API is down', async () => {
    localStorage.setItem('accessToken', ACCESS_TOKEN);
    server.use(http.get(api('users/me'), () => HttpResponse.json({}, { status: 500 })));
    renderRoutes(
      <Route element={<PrivateRoutes />}>
        <Route path="/privado" element={<h1>Privado</h1>} />
      </Route>,
      { route: '/privado', companies: [] },
    );

    expect(await screen.findByRole('button', { name: /tentar novamente/i })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Onboarding' })).not.toBeInTheDocument();
  });
});

describe('PublicRoutes', () => {
  it('lets an anonymous visitor through', () => {
    renderRoutes(
      <Route element={<PublicRoutes />}>
        <Route path="/entrar" element={<h1>Entrar</h1>} />
      </Route>,
      { route: '/entrar' },
    );

    expect(screen.getByRole('heading', { name: 'Entrar' })).toBeInTheDocument();
  });

  it('bounces an authenticated user to home', () => {
    localStorage.setItem('accessToken', ACCESS_TOKEN);
    renderRoutes(
      <Route element={<PublicRoutes />}>
        <Route path="/entrar" element={<h1>Entrar</h1>} />
      </Route>,
      { route: '/entrar' },
    );

    expect(screen.getByRole('heading', { name: 'Home' })).toBeInTheDocument();
  });
});

describe('OnboardingRoute', () => {
  it('requires a token', () => {
    renderRoutes(
      <Route element={<OnboardingRoute />}>
        <Route path="/comecar" element={<h1>Começar</h1>} />
      </Route>,
      { route: '/comecar' },
    );

    expect(screen.getByRole('heading', { name: 'Login' })).toBeInTheDocument();
  });

  it('shows the onboarding to a user with no company', async () => {
    givenSession([]);
    renderRoutes(
      <Route element={<OnboardingRoute />}>
        <Route path="/comecar" element={<h1>Começar</h1>} />
      </Route>,
      { route: '/comecar', companies: [] },
    );

    expect(await screen.findByRole('heading', { name: 'Começar' })).toBeInTheDocument();
  });

  it('sends a user who already has a company back home', async () => {
    givenSession();
    renderRoutes(
      <Route element={<OnboardingRoute />}>
        <Route path="/comecar" element={<h1>Começar</h1>} />
      </Route>,
      { route: '/comecar' },
    );

    expect(await screen.findByRole('heading', { name: 'Home' })).toBeInTheDocument();
  });
});

describe('permission guards', () => {
  const guardedRoute = (element: ReactElement) => (
    <Route element={element}>
      <Route path="/protegida" element={<h1>Protegida</h1>} />
    </Route>
  );

  it('lets the owner into a tag-guarded route', async () => {
    renderRoutes(guardedRoute(<PermissionRoute tag="agents" />), { route: '/protegida' });

    expect(await screen.findByRole('heading', { name: 'Protegida' })).toBeInTheDocument();
  });

  it('redirects a member without the tag', async () => {
    givenMemberPermissions([]);
    renderRoutes(guardedRoute(<PermissionRoute tag="agents" />), {
      route: '/protegida',
      companies: [asMember],
    });

    expect(await screen.findByRole('heading', { name: 'Home' })).toBeInTheDocument();
  });

  it('lets a member with the tag through', async () => {
    givenMemberPermissions([buildRoutePermission({ tag: 'agents' })]);
    renderRoutes(guardedRoute(<PermissionRoute tag="agents" />), {
      route: '/protegida',
      companies: [asMember],
    });

    expect(await screen.findByRole('heading', { name: 'Protegida' })).toBeInTheDocument();
  });

  it('lets a member through when any tag of a list is granted', async () => {
    givenMemberPermissions([buildRoutePermission({ tag: 'agents', method: 'GET', path: '/v1/agents/mcp-servers/' })]);
    renderRoutes(guardedRoute(<PermissionRoute tag={['chat', 'agents']} />), { route: '/protegida', companies: [asMember] });

    expect(await screen.findByRole('heading', { name: 'Protegida' })).toBeInTheDocument();
  });

  it('keeps a member out when no tag of a list is granted', async () => {
    givenMemberPermissions([buildRoutePermission({ tag: 'companies', path: '/v1/companies/' })]);
    renderRoutes(guardedRoute(<PermissionRoute tag={['chat', 'agents']} />), { route: '/protegida', companies: [asMember] });

    expect(await screen.findByRole('heading', { name: 'Home' })).toBeInTheDocument();
  });

  it('lets in a member who has the route permission', async () => {
    givenMemberPermissions([
      buildRoutePermission({ method: 'GET', path: '/v1/agents/mcp-servers/' }),
    ]);
    renderRoutes(guardedRoute(<RoutePermissionRoute permission={MCP_SERVER_ROUTE_PERMISSIONS.list} />), {
      route: '/protegida',
      companies: [asMember],
    });

    expect(await screen.findByRole('heading', { name: 'Protegida' })).toBeInTheDocument();
  });

  it('keeps out a member who has other permissions but not that route', async () => {
    givenMemberPermissions([buildRoutePermission({ method: 'PATCH', path: '/v1/agents/{agent_id}/' })]);
    renderRoutes(guardedRoute(<RoutePermissionRoute permission={MCP_SERVER_ROUTE_PERMISSIONS.list} />), {
      route: '/protegida',
      companies: [asMember],
    });

    expect(await screen.findByRole('heading', { name: 'Home' })).toBeInTheDocument();
  });

  it('lets a member through when any route of a list is granted', async () => {
    givenMemberPermissions([
      buildRoutePermission({ tag: 'companies', method: 'DELETE', path: '/v1/companies/{target_company_id}/' }),
    ]);
    renderRoutes(guardedRoute(<RoutePermissionRoute permission={Object.values(COMPANY_ROUTE_PERMISSIONS)} />), {
      route: '/protegida',
      companies: [asMember],
    });

    expect(await screen.findByRole('heading', { name: 'Protegida' })).toBeInTheDocument();
  });
});

describe('redirects', () => {
  it('lands the IA index on chats when the user can chat', async () => {
    renderRoutes(<Route path="/ia" element={<IaIndexRedirect />} />, { route: '/ia' });

    expect(await screen.findByRole('heading', { name: 'Conversas' })).toBeInTheDocument();
  });

  it('lands the IA index on agents when the user cannot chat', async () => {
    givenMemberPermissions([buildRoutePermission({ tag: 'agents', path: '/v1/agents/' })]);
    renderRoutes(<Route path="/ia" element={<IaIndexRedirect />} />, {
      route: '/ia',
      companies: [asMember],
    });

    expect(await screen.findByRole('heading', { name: 'Agentes' })).toBeInTheDocument();
  });

  it('lands the IA index on usage when the member can only see the usage report', async () => {
    givenMemberPermissions([buildRoutePermission({ tag: 'chat', method: 'GET', path: '/v1/chats/usage/' })]);
    renderRoutes(<Route path="/ia" element={<IaIndexRedirect />} />, {
      route: '/ia',
      companies: [asMember],
    });

    expect(await screen.findByRole('heading', { name: 'Consumo' })).toBeInTheDocument();
  });

  it('keeps the chat id when redirecting the legacy messages deep link', async () => {
    renderRoutes(
      <Route path="/chats/:chatId/mensagens" element={<RedirectLegacyChatMessages />} />,
      { route: `/chats/${uuid(9)}/mensagens` },
    );

    expect(await screen.findByRole('heading', { name: 'Mensagens' })).toBeInTheDocument();
  });
});
