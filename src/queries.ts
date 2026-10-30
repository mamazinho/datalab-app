import { queryOptions } from '@tanstack/react-query';
import { DatalabAPI } from './services/datalab-api';
import type { UUID7 } from './types/ids';
import type { IntegrationKey, Provider } from './types/integrations';

export const meQuery = queryOptions({
  queryKey: ['me'],
  queryFn: () => DatalabAPI.UsersResource.me(),
});

export const chatListsQueryKey = ['chats'] as const;

export const chatsQuery = (includeArchived: boolean) =>
  queryOptions({
    queryKey: [...chatListsQueryKey, { includeArchived }],
    queryFn: () => DatalabAPI.ChatsResource.getAllChats({ archived: includeArchived }),
  });

export const chatQuery = (chatId: UUID7) =>
  queryOptions({
    queryKey: ['chat', chatId],
    queryFn: () => DatalabAPI.ChatsResource.getChat(chatId),
  });

// No background refetch: it would reset the local timeline in the middle of a stream
export const chatMessagesQuery = (chatId: UUID7) =>
  queryOptions({
    queryKey: ['chat-messages', chatId],
    queryFn: () => DatalabAPI.ChatMessagesResource.getChatMessages(chatId),
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: false,
  });

export const chatUsageReportQuery = (start: string, end: string) =>
  queryOptions({
    queryKey: ['chat-usage-report', start, end],
    queryFn: () => DatalabAPI.ChatsResource.getUsageReport({ start, end }),
  });

export const supervisorQuery = queryOptions({
  queryKey: ['supervisor'],
  queryFn: () => DatalabAPI.AgentsResource.getSupervisor(),
  staleTime: Infinity,
});

export const agentsQuery = queryOptions({
  queryKey: ['agents'],
  queryFn: () => DatalabAPI.AgentsResource.listAgents(),
});

export const availableModelsQuery = queryOptions({
  queryKey: ['available-models'],
  queryFn: () => DatalabAPI.AgentsResource.listAvailableModels(),
  staleTime: 5 * 60_000,
});

export const mcpServersQuery = queryOptions({
  queryKey: ['mcp-servers'],
  queryFn: () => DatalabAPI.McpServersResource.listMcpServers(),
});

// companyId is only a cache key; the request takes the company from the X-Company-Id interceptor
export const currentMembershipQuery = (companyId: UUID7) =>
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

export const memberRoutePermissionsQuery = (memberId: UUID7) =>
  queryOptions({
    queryKey: ['member-route-permissions', memberId],
    queryFn: () => DatalabAPI.MembershipsResource.listMemberRoutePermissions(memberId),
  });

export const providerPermissionsQuery = queryOptions({
  queryKey: ['provider-permissions'],
  queryFn: () => DatalabAPI.MembershipsResource.listProviderPermissions(),
});

export const memberProviderPermissionsQuery = (memberId: UUID7) =>
  queryOptions({
    queryKey: ['member-provider-permissions', memberId],
    queryFn: () => DatalabAPI.MembershipsResource.listMemberProviderPermissions(memberId),
  });

export const integrationsQuery = queryOptions({
  queryKey: ['integrations'],
  queryFn: () => DatalabAPI.AuthResource.listIntegrations(),
});

export const companyProviderAssetsQuery = (companyId: UUID7, provider?: Provider) =>
  queryOptions({
    queryKey: ['company-provider-assets', companyId, provider ?? 'all'],
    queryFn: () => DatalabAPI.CompaniesResource.listProviderAssets(companyId, provider),
  });

// Always fresh: what the provider exposes changes outside the app
export const availableProviderAssetsQuery = (companyId: UUID7, integration: IntegrationKey) =>
  queryOptions({
    queryKey: ['available-provider-assets', companyId, integration],
    queryFn: () =>
      DatalabAPI.CompaniesResource.listAvailableProviderAssets(companyId, integration),
    staleTime: 0,
    refetchOnMount: 'always',
  });
