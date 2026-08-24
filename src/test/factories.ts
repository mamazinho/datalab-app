import type { UUID } from '../types/ids';
import type { IRetrieveAgentWithState } from '../services/datalab-api/agentsResource';
import type { IRetrieveChat } from '../services/datalab-api/chatsResource';
import type {
  ICompanyMembership,
  ICurrentMembership,
} from '../services/datalab-api/membershipsResource';
import type {
  IRoutePermission,
  IUserCompany,
  IUserInvite,
  IUserResponse,
} from '../services/datalab-api/usersResource';

/**
 * Fábricas de payload do backend. Sempre com valores fixos e overrides parciais:
 * teste que depende de um campo declara esse campo, o resto some do ruído.
 */

const TIMESTAMPS = { created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z' };

/**
 * UUID v4 válido e determinístico a partir de um número — id legível no output
 * do teste. O padStart é o que mantém o primeiro bloco com 8 dígitos: sem ele
 * seeds de dois dígitos produzem um id que o isUuid rejeita.
 */
export const uuid = (seed: number): UUID =>
  `${String(seed).padStart(8, '0')}-0000-4000-8000-000000000000` as UUID;

export const buildCompany = (overrides: Partial<IUserCompany> = {}): IUserCompany => ({
  id: uuid(1),
  name: 'Datalab',
  status: 'active',
  ...TIMESTAMPS,
  membership: {
    id: uuid(2),
    membership_role: 'owner',
    status: 'active',
    ...TIMESTAMPS,
  },
  ...overrides,
});

export const buildUser = (overrides: Partial<IUserResponse> = {}): IUserResponse => ({
  id: uuid(3),
  name: 'Ana Souza',
  email: 'ana@datalab.com',
  status: 'active',
  role: 'user',
  phone_number: '+5541999999999',
  avatar_url: null,
  ...TIMESTAMPS,
  config: { theme: 'light' },
  invites: [],
  companies: [buildCompany()],
  ...overrides,
});

export const buildRoutePermission = (overrides: Partial<IRoutePermission> = {}): IRoutePermission => ({
  id: uuid(4),
  method: 'POST',
  path: '/v1/agents/',
  name: 'create_agent',
  description: '',
  tag: 'agents',
  ...TIMESTAMPS,
  ...overrides,
});

export const buildMember = (overrides: Partial<ICompanyMembership> = {}): ICompanyMembership => ({
  id: uuid(5),
  user_id: uuid(6),
  company_id: uuid(1),
  membership_role: 'member',
  status: 'active',
  ...TIMESTAMPS,
  user: { id: uuid(6), name: 'Bruno Lima', email: 'bruno@datalab.com' },
  ...overrides,
});

export const buildCurrentMembership = (
  overrides: Partial<ICurrentMembership> = {},
): ICurrentMembership => ({
  id: uuid(2),
  user_id: uuid(3),
  company_id: uuid(1),
  membership_role: 'owner',
  status: 'active',
  ...TIMESTAMPS,
  company: null,
  permissions: [],
  provider_permissions: {},
  ...overrides,
});

export const buildChat = (overrides: Partial<IRetrieveChat> = {}): IRetrieveChat => ({
  id: uuid(20),
  user_id: uuid(3),
  title: 'Análise de vendas',
  input_tokens: 0,
  output_tokens: 0,
  number_of_requests: 0,
  created_at: new Date('2026-01-01T00:00:00Z'),
  updated_at: new Date('2026-01-01T00:00:00Z'),
  ...overrides,
});

export const buildAgent = (overrides: Partial<IRetrieveAgentWithState> = {}): IRetrieveAgentWithState => ({
  id: uuid(10),
  type: 'specialist',
  key: 'ga4_specialist',
  name: 'Especialista GA4',
  avatar_url: null,
  description: 'Responde sobre o Google Analytics',
  model_name: 'gpt-4o',
  is_system: false,
  is_active: true,
  mcp_servers: [],
  disabled_by_company: false,
  disabled_by_user: false,
  is_enabled: true,
  ...overrides,
});

export const buildInvite = (overrides: Partial<IUserInvite> = {}): IUserInvite => ({
  id: uuid(7),
  email: 'ana@datalab.com',
  company_id: uuid(1),
  invited_by_user_id: uuid(8),
  membership_role: 'member',
  status: 'pending',
  ...TIMESTAMPS,
  company: buildCompany({ name: 'Acme' }),
  invited_by: { id: uuid(8), name: 'Carla Dias', email: 'carla@acme.com' },
  permissions: [],
  provider_permissions: [],
  ...overrides,
});
