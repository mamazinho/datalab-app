import type { IRoutePermission } from '../services/datalab-api/usersResource';

export interface IRoutePermissionRef {
  // Backend route name; preferred over method and path when present
  name?: string;
  method: string;
  path: string;
}

const PARAM_SEGMENT_REGEX = /^\{.+\}$/;

// "/v1/agents/{agent_id}/company-state/" → "/agents/{param}/company-state/"
export const normalizeRoutePath = (path: string): string => {
  // A malformed permission must not break the whole CompanyProvider
  if (!path) return '/';

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
): boolean => {
  if (ref.name && permission.name === ref.name) return true;

  return (
    permission.method.toUpperCase() === ref.method.toUpperCase() &&
    normalizeRoutePath(permission.path) === normalizeRoutePath(ref.path)
  );
};

// Accepts both the flat permission and the old grant row (.route_permission): a contract change must not blank the app
export const toRoutePermission = (entry: unknown): IRoutePermission | null => {
  if (!entry || typeof entry !== 'object') return null;

  const permission =
    'route_permission' in entry
      ? (entry as { route_permission: unknown }).route_permission
      : entry;

  if (!permission || typeof permission !== 'object') return null;

  const { method, path } = permission as Partial<IRoutePermission>;

  return typeof method === 'string' && typeof path === 'string'
    ? (permission as IRoutePermission)
    : null;
};

export const isAgentsRoutePermission = (permission: IRoutePermission): boolean =>
  permission.tag === 'agents' || normalizeRoutePath(permission.path).startsWith('/agents/');

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
  usageReport: { method: 'GET', path: 'chats/usage/' },
  update: { method: 'PATCH', path: 'chats/{chat_id}/' },
  remove: { method: 'DELETE', path: 'chats/{chat_id}/' },
} as const satisfies Record<string, IRoutePermissionRef>;

export const COMPANY_ROUTE_PERMISSIONS = {
  update: { method: 'PATCH', path: 'companies/{id}/' },
  remove: { method: 'DELETE', path: 'companies/{id}/' },
} as const satisfies Record<string, IRoutePermissionRef>;
