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
import {
  AgentsRoute,
  CompanyManagementRoute,
  IaIndexRedirect,
  IaRoute,
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
      HttpResponse.json(buildCurrentMembership({ membership_role: 'member', permissions })),
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

  it('opens the IA section for someone who only has agents permission', async () => {
    givenMemberPermissions([buildRoutePermission({ tag: 'agents', path: '/v1/agents/' })]);
    renderRoutes(guardedRoute(<IaRoute />), { route: '/protegida', companies: [asMember] });

    expect(await screen.findByRole('heading', { name: 'Protegida' })).toBeInTheDocument();
  });

  it('opens the IA section for someone who only has chat permission', async () => {
    givenMemberPermissions([buildRoutePermission({ tag: 'chat', path: '/v1/chats/' })]);
    renderRoutes(guardedRoute(<IaRoute />), { route: '/protegida', companies: [asMember] });

    expect(await screen.findByRole('heading', { name: 'Protegida' })).toBeInTheDocument();
  });

  it('closes the IA section for someone with neither', async () => {
    givenMemberPermissions([buildRoutePermission({ tag: 'companies', path: '/v1/companies/' })]);
    renderRoutes(guardedRoute(<IaRoute />), { route: '/protegida', companies: [asMember] });

    expect(await screen.findByRole('heading', { name: 'Home' })).toBeInTheDocument();
  });

  it('guards the agents tab by any agents permission', async () => {
    givenMemberPermissions([buildRoutePermission({ tag: 'chat', path: '/v1/chats/' })]);
    renderRoutes(guardedRoute(<AgentsRoute />), { route: '/protegida', companies: [asMember] });

    expect(await screen.findByRole('heading', { name: 'Home' })).toBeInTheDocument();
  });

  it('guards the company tab by edit or delete permission', async () => {
    givenMemberPermissions([
      buildRoutePermission({ tag: 'companies', method: 'DELETE', path: '/v1/companies/{id}/' }),
    ]);
    renderRoutes(guardedRoute(<CompanyManagementRoute />), {
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

  it('keeps the chat id when redirecting the legacy messages deep link', async () => {
    renderRoutes(
      <Route path="/chats/:chatId/mensagens" element={<RedirectLegacyChatMessages />} />,
      { route: `/chats/${uuid(9)}/mensagens` },
    );

    expect(await screen.findByRole('heading', { name: 'Mensagens' })).toBeInTheDocument();
  });
});
