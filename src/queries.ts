import { queryOptions } from '@tanstack/react-query';
import { DatalabAPI } from './services/datalab-api';
import type { UUID } from './types/ids';
import type { IntegrationKey, Provider } from './types/integrations';

/**
 * Catálogo central das queries do app: key + queryFn definidos UMA vez.
 * Componentes consomem com useSuspenseQuery(xQuery) e mutações invalidam
 * com xQuery.queryKey — typo em key vira erro de compilação.
 */

export const meQuery = queryOptions({
  queryKey: ['me'],
  queryFn: () => DatalabAPI.UsersResource.me(),
});

export const chatsQuery = queryOptions({
  queryKey: ['chats'],
  queryFn: () => DatalabAPI.ChatsResource.getAllChats(),
});

// Detalhes de um chat, quentes do backend — a página de mensagens não depende
// da lista ['chats'] (que pode estar velha na outra página).
export const chatQuery = (chatId: UUID) =>
  queryOptions({
    queryKey: ['chat', chatId],
    queryFn: () => DatalabAPI.ChatsResource.getChat(chatId),
  });

// Histórico sempre fresco ao montar; nunca refetch em background —
// um refetch durante o streaming resetaria a timeline local do chat.
export const chatMessagesQuery = (chatId: UUID) =>
  queryOptions({
    queryKey: ['chat-messages', chatId],
    queryFn: () => DatalabAPI.ChatMessagesResource.getChatMessages(chatId),
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: false,
  });

export const agentsQuery = queryOptions({
  queryKey: ['agents'],
  queryFn: () => DatalabAPI.AgentsResource.listAgents(),
});

// Membership ativa (role + company + permissões) da empresa selecionada.
// companyId entra na key só como identidade de cache (uma entrada por empresa,
// refetch ao trocar); o X-Company-Id da requisição vem do interceptor.
export const currentMembershipQuery = (companyId: UUID) =>
  queryOptions({
    queryKey: ['current-membership', companyId],
    queryFn: () => DatalabAPI.MembershipsResource.getCurrentMembership(),
  });

export const membersQuery = queryOptions({
  queryKey: ['members'],
  queryFn: () => DatalabAPI.MembershipsResource.listMembers(),
});

export const invitesQuery = queryOptions({
  queryKey: ['invites'],
  queryFn: () => DatalabAPI.MembershipsResource.listInvites(),
});

export const routePermissionsQuery = queryOptions({
  queryKey: ['route-permissions'],
  queryFn: () => DatalabAPI.MembershipsResource.listRoutePermissions(),
});

export const memberPermissionsQuery = (memberId: UUID) =>
  queryOptions({
    queryKey: ['member-permissions', memberId],
    queryFn: () => DatalabAPI.MembershipsResource.listMemberPermissions(memberId),
  });

// Catálogo das permissões de provider ("permissões nos agentes") — o par das
// route permissions para o que não é rota da Datalab.
export const providerPermissionsQuery = queryOptions({
  queryKey: ['provider-permissions'],
  queryFn: () => DatalabAPI.MembershipsResource.listProviderPermissions(),
});

export const memberProviderPermissionsQuery = (memberId: UUID) =>
  queryOptions({
    queryKey: ['member-provider-permissions', memberId],
    queryFn: () => DatalabAPI.MembershipsResource.listMemberProviderPermissions(memberId),
  });

// Conexões OAuth do usuário logado (é por usuário, não por empresa).
export const integrationsQuery = queryOptions({
  queryKey: ['integrations'],
  queryFn: () => DatalabAPI.AuthResource.listIntegrations(),
});

// Allowlist de ativos da empresa. companyId entra na key porque trocar de
// empresa troca a lista inteira — nunca reaproveitar cache entre empresas.
export const companyProviderAssetsQuery = (companyId: UUID, provider?: Provider) =>
  queryOptions({
    queryKey: ['company-provider-assets', companyId, provider ?? 'all'],
    queryFn: () => DatalabAPI.CompaniesResource.listProviderAssets(companyId, provider),
  });

// Ativos que a conta conectada enxerga + os já liberados (marca os checkboxes).
// Sempre fresco: o que o provider expõe muda fora do app.
export const availableProviderAssetsQuery = (companyId: UUID, integration: IntegrationKey) =>
  queryOptions({
    queryKey: ['available-provider-assets', companyId, integration],
    queryFn: () =>
      DatalabAPI.CompaniesResource.listAvailableProviderAssets(companyId, integration),
    staleTime: 0,
    refetchOnMount: 'always',
  });
