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
  // Blindagem: uma permissão malformada não pode derrubar o CompanyProvider inteiro.
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

/**
 * `/memberships/current` já devolveu a permissão dentro da linha de concessão
 * (`.route_permission`) e hoje devolve achatada. Aceitar as duas formas — e
 * exigir os campos que as checagens leem — evita que uma mudança de contrato
 * derrube o CompanyProvider inteiro, que significa tela branca no app.
 */
export const toRoutePermission = (entry: unknown): IRoutePermission | null => {
  if (!entry || typeof entry !== 'object') return null;

  const permission =
    'route_permission' in entry
      ? (entry as { route_permission: unknown }).route_permission
      : entry;

  if (!permission || typeof permission !== 'object') return null;

  // method e path são lidos sem defesa por matchesRoutePermission/normalizeRoutePath:
  // um item pela metade tem que ser descartado aqui, não estourar lá na frente.
  const { method, path } = permission as Partial<IRoutePermission>;

  return typeof method === 'string' && typeof path === 'string'
    ? (permission as IRoutePermission)
    : null;
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

// Gerenciamento de empresa: editar nome e deletar a empresa ativa.
export const COMPANY_ROUTE_PERMISSIONS = {
  update: { method: 'PATCH', path: 'companies/{id}/' },
  remove: { method: 'DELETE', path: 'companies/{id}/' },
} as const satisfies Record<string, IRoutePermissionRef>;
