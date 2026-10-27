import { http, HttpResponse } from 'msw';
import { buildAgent, buildChat, buildChatUsageReport, buildCompany, buildCurrentMembership, buildInvite, buildMcpServer, buildMember, buildMcpServerTestResult, buildModelProvider, buildUser, uuid } from '../factories';

const BASE_URL = import.meta.env.VITE_DATALAB_API_URL;

/** Monta a URL absoluta que o axios vai emitir a partir do baseURL. */
export const api = (path: string): string => `${BASE_URL}/${path.replace(/^\//, '')}`;

export const ACCESS_TOKEN = 'access-token-do-teste';

/**
 * Happy path de tudo que a árvore de providers pede ao montar. Cada teste
 * sobrescreve o que interessa com server.use(...) — o resto continua respondendo,
 * então nenhuma tela quebra por endpoint esquecido.
 */
export const handlers = [
  http.post(api('auth/login/'), () =>
    HttpResponse.json({
      access_token: ACCESS_TOKEN,
      token_type: 'bearer',
      expires_in: 3600,
      scope: '',
    }),
  ),

  http.post(api('auth/refresh/'), () => HttpResponse.json({ access_token: ACCESS_TOKEN })),

  http.post(api('auth/logout/'), () => new HttpResponse(null, { status: 204 })),

  http.get(api('users/me'), () => HttpResponse.json(buildUser())),

  http.delete(api('users/me'), () => new HttpResponse(null, { status: 204 })),

  http.patch(api('users/me'), async ({ request }) =>
    HttpResponse.json(buildUser(await request.json() as object)),
  ),

  http.post(api('users'), async ({ request }) => {
    const { email } = (await request.json()) as { email: string };
    return HttpResponse.json(buildUser({ email, status: 'pending' }), { status: 201 });
  }),

  http.post(api('users/:userId/confirm-account'), () => HttpResponse.json(buildUser())),

  http.post(api('users/:userId/resend-confirmation'), () => HttpResponse.json(buildUser())),

  http.post(api('users/forgot-password'), () => new HttpResponse(null, { status: 204 })),

  http.post(api('users/change-password'), () => HttpResponse.json(buildUser())),

  http.post(api('users/me/invites/:inviteId/accept'), () => HttpResponse.json(buildInvite({ status: 'accepted' }))),

  http.post(api('users/me/invites/:inviteId/decline'), () => HttpResponse.json(buildInvite({ status: 'declined' }))),

  http.get(api('memberships/current/'), () => HttpResponse.json(buildCurrentMembership())),

  http.post(api('companies/'), async ({ request }) => {
    const { name } = (await request.json()) as { name: string };
    const company = buildCompany({ name });
    return HttpResponse.json(
      {
        company: { ...company, created_by_user_id: uuid(3) },
        membership: { ...company.membership, user_id: uuid(3), company_id: company.id },
      },
      { status: 201 },
    );
  }),

  http.get(api('memberships/members/'), () => HttpResponse.json([])),

  http.delete(api('memberships/members/:membershipId'), () => new HttpResponse(null, { status: 204 })),

  http.post(api('memberships/transfer-ownership'), () =>
    HttpResponse.json(buildMember({ membership_role: 'owner' })),
  ),

  http.get(api('memberships/invites/'), () => HttpResponse.json([])),

  http.put(api('memberships/invites/'), () => HttpResponse.json([buildInvite()])),

  http.delete(api('memberships/invites/:inviteId'), () => new HttpResponse(null, { status: 204 })),

  http.get(api('memberships/route-permissions/'), () => HttpResponse.json([])),

  http.get(api('memberships/provider-permissions/'), () => HttpResponse.json([])),

  http.get(api('auth/integrations/'), () => HttpResponse.json([])),

  http.get(api('agents/supervisor/'), () =>
    HttpResponse.json(buildAgent({ type: 'supervisor', key: 'supervisor', name: 'Supervisor' })),
  ),

  http.get(api('agents/'), () => HttpResponse.json([])),

  http.get(api('agents/available-models'), () =>
    HttpResponse.json([
      buildModelProvider(),
      buildModelProvider({
        provider: 'google',
        display_name: 'Google',
        models: [{ name: 'gemini-2.5-pro', display_name: 'Gemini 2.5 Pro' }],
      }),
    ]),
  ),

  http.post(api('agents/'), async ({ request }) =>
    HttpResponse.json(buildAgent(await request.json() as object), { status: 201 }),
  ),

  http.patch(api('agents/:agentId/'), async ({ request }) =>
    HttpResponse.json(buildAgent(await request.json() as object)),
  ),

  http.delete(api('agents/:agentId/'), () => new HttpResponse(null, { status: 204 })),

  http.put(api('agents/:agentId/company-state/'), () => new HttpResponse(null, { status: 204 })),

  http.put(api('agents/:agentId/user-state/'), () => new HttpResponse(null, { status: 204 })),

  http.get(api('agents/mcp-servers/'), () => HttpResponse.json([])),

  http.post(api('agents/mcp-servers/'), () => HttpResponse.json(buildMcpServer(), { status: 201 })),

  http.patch(api('agents/mcp-servers/:mcpServerId/'), () => HttpResponse.json(buildMcpServer())),

  http.delete(api('agents/mcp-servers/:mcpServerId/'), () => new HttpResponse(null, { status: 204 })),

  http.post(api('agents/mcp-servers/test/'), () => HttpResponse.json(buildMcpServerTestResult())),

  http.get(api('chats/'), () => HttpResponse.json([])),

  http.post(api('chats/'), async ({ request }) =>
    HttpResponse.json(buildChat(await request.json() as object), { status: 201 }),
  ),

  // Antes de chats/:chatId/, que também casaria com "usage".
  http.get(api('chats/usage/'), () => HttpResponse.json(buildChatUsageReport())),

  http.get(api('chats/:chatId/'), () => HttpResponse.json(buildChat())),

  http.patch(api('chats/:chatId/'), async ({ request }) =>
    HttpResponse.json(buildChat(await request.json() as object)),
  ),

  http.delete(api('chats/:chatId/'), () => new HttpResponse(null, { status: 204 })),

  http.get(api('chats/:chatId/messages/'), () => HttpResponse.json([])),
];
