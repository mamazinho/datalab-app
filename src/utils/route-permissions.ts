import type { IRoutePermission } from '../services/datalab-api/usersResource';

export interface IRoutePermissionRef {
  method: string;
  path: string;
}

const PARAM_SEGMENT_REGEX = /^\{.+\}$/;

// "/v1/agents/{agent_id}/company-state/" → "/agents/{param}/company-state/"
export const normalizeRoutePath = (path: string): string => {
  const segments = path.split('/').filter(Boolean);

  if (segments[0] === 'v1') {
    segments.shift();
  }

  if (!segments.length) return '/';

  const normalizedSegments = segments.map((segment) =>
    PARAM_SEGMENT_REGEX.test(segment) ? '{param}' : segment,
  );

  return `/${normalizedSegments.join('/')}/`;
};

export const matchesRoutePermission = (
  permission: IRoutePermission,
  ref: IRoutePermissionRef,
): boolean =>
  permission.method.toUpperCase() === ref.method.toUpperCase() &&
  normalizeRoutePath(permission.path) === normalizeRoutePath(ref.path);

export const AGENT_ROUTE_PERMISSIONS = {
  create: { method: 'POST', path: 'agents/' },
  update: { method: 'PATCH', path: 'agents/{agent_id}/' },
  remove: { method: 'DELETE', path: 'agents/{agent_id}/' },
  companyState: { method: 'PUT', path: 'agents/{agent_id}/company-state/' },
} as const satisfies Record<string, IRoutePermissionRef>;

export const MCP_SERVER_ROUTE_PERMISSIONS = {
  list: { method: 'GET', path: 'agents/mcp-servers/' },
  create: { method: 'POST', path: 'agents/mcp-servers/' },
  update: { method: 'PATCH', path: 'agents/mcp-servers/{mcp_server_id}/' },
  remove: { method: 'DELETE', path: 'agents/mcp-servers/{mcp_server_id}/' },
  test: { method: 'POST', path: 'agents/mcp-servers/test/' },
} as const satisfies Record<string, IRoutePermissionRef>;

export const CHAT_ROUTE_PERMISSIONS = {
  list: { method: 'GET', path: 'chats/' },
  usageReport: { method: 'GET', path: 'chats/usage/' },
  update: { method: 'PATCH', path: 'chats/{chat_id}/' },
  remove: { method: 'DELETE', path: 'chats/{chat_id}/' },
} as const satisfies Record<string, IRoutePermissionRef>;

export const MEMBERSHIP_ROUTE_PERMISSIONS = {
  list: { method: 'GET', path: 'memberships/members/' },
  listInvites: { method: 'GET', path: 'memberships/invites/' },
  listMemberRoutePermissions: { method: 'GET', path: 'memberships/members/{membership_id}/route-permissions/' },
  listMemberProviderPermissions: { method: 'GET', path: 'memberships/members/{membership_id}/provider-permissions/' },
  invite: { method: 'PUT', path: 'memberships/invites/' },
  removeInvite: { method: 'DELETE', path: 'memberships/invites/{invite_id}/' },
  updatePermissions: { method: 'PUT', path: 'memberships/members/{membership_id}/permissions/' },
  remove: { method: 'DELETE', path: 'memberships/members/{membership_id}/' },
} as const satisfies Record<string, IRoutePermissionRef>;

export const COMPANY_ROUTE_PERMISSIONS = {
  update: { method: 'PATCH', path: 'companies/{id}/' },
  remove: { method: 'DELETE', path: 'companies/{id}/' },
} as const satisfies Record<string, IRoutePermissionRef>;
