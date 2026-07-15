import type { IRoutePermission } from '../services/datalab-api/usersResource';

export interface IRoutePermissionRef {
  /** name da rota no backend — quando preenchido, é o critério preferido de match */
  name?: string;
  method: string;
  path: string;
}

const PARAM_SEGMENT_REGEX = /^\{.+\}$/;

/**
 * Normaliza um path de rota para comparação tolerante:
 * remove prefixo "v1", barras duplicadas/soltas e unifica placeholders
 * ("{agent_id}" e "{id}" viram "{param}").
 * Ex.: "/v1/agents/{agent_id}/company-state/" → "/agents/{param}/company-state/"
 */
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
): boolean => {
  if (ref.name && permission.name === ref.name) return true;

  return (
    permission.method.toUpperCase() === ref.method.toUpperCase() &&
    normalizeRoutePath(permission.path) === normalizeRoutePath(ref.path)
  );
};

export const isAgentsRoutePermission = (permission: IRoutePermission): boolean =>
  permission.tag === 'agents' || normalizeRoutePath(permission.path).startsWith('/agents/');

// Preencher `name` de cada rota com o name real do backend quando confirmado
export const AGENT_ROUTE_PERMISSIONS = {
  create: { method: 'POST', path: 'agents/' },
  update: { method: 'PATCH', path: 'agents/{agent_id}/' },
  remove: { method: 'DELETE', path: 'agents/{agent_id}/' },
  companyState: { method: 'PUT', path: 'agents/{agent_id}/company-state/' },
} as const satisfies Record<string, IRoutePermissionRef>;
