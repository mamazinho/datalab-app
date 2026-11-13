import type { IApiError } from '../types/errors';
import type { UUID7 } from '../types/ids';
import type {
  IListAvailableModelsResponse,
  IRetrieveAgentWithState,
} from '../services/datalab-api/agentsResource';
import type {
  IChatUsage,
  IChatUsageByChat,
  IChatUsageReport,
  IRetrieveChat,
} from '../services/datalab-api/chatsResource';
import type { IRetrieveMcpServer, ITestMcpServerResponse } from '../services/datalab-api/mcpServersResource';
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

import type {
  IBuildResult,
  IContainerFile,
  IImportHelp,
  IPublicationResult,
  ISiteAnalysis,
  ITrackingIdRule,
  ITrackingRules,
} from '../services/datalab-api/trackingResource';

const TIMESTAMPS = { created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z' };

export const buildApiError = (overrides: Partial<IApiError> = {}): IApiError => ({
  error: 'HTTPErrorFriendlyException',
  status: 400,
  message: 'Bad Request',
  friendly_message: 'Não foi possível concluir a solicitação.',
  detail: null,
  ...overrides,
});

// padStart keeps the first block at 8 digits; without it, two-digit seeds make ids that isUuid rejects
export const uuid = (seed: number): UUID7 =>
  `${String(seed).padStart(8, '0')}-0000-7000-8000-000000000000` as UUID7;

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
  route_permissions: [],
  provider_permissions: {},
  ...overrides,
});

export const buildChat = (overrides: Partial<IRetrieveChat> = {}): IRetrieveChat => ({
  id: uuid(20),
  company_id: uuid(1),
  title: 'Análise de vendas',
  is_private: true,
  archived: false,
  created_by_membership_id: uuid(2),
  created_by: { name: 'Ana Souza', avatar_url: null },
  ...TIMESTAMPS,
  ...overrides,
});

export const buildChatUsage = (overrides: Partial<IChatUsage> = {}): IChatUsage => ({
  input_tokens: 0,
  output_tokens: 0,
  requests: 0,
  ...overrides,
});

export const buildChatUsageByChat = (overrides: Partial<IChatUsageByChat> = {}): IChatUsageByChat => ({
  ...buildChatUsage(),
  chat_id: uuid(20),
  title: 'Análise de vendas',
  is_private: false,
  archived: false,
  deleted: false,
  created_by: { name: 'Ana Souza', avatar_url: null },
  ...overrides,
});

export const buildChatUsageReport = (overrides: Partial<IChatUsageReport> = {}): IChatUsageReport => ({
  start: '2026-01-01',
  end: '2026-01-31',
  totals: buildChatUsage(),
  by_member: [],
  by_chat: [],
  by_origin: [],
  by_model: [],
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

export const buildModelProvider = (
  overrides: Partial<IListAvailableModelsResponse> = {},
): IListAvailableModelsResponse => ({
  provider: 'openai',
  display_name: 'OpenAI',
  models: [
    { name: 'gpt-4o', display_name: 'GPT-4o' },
    { name: 'gpt-4o-mini', display_name: 'GPT-4o mini' },
  ],
  ...overrides,
});

export const buildInvite = (overrides: Partial<IUserInvite> = {}): IUserInvite => ({
  id: uuid(7),
  email: 'ana@datalab.com',
  company_id: uuid(1),
  invited_by_membership_id: uuid(8),
  status: 'pending',
  ...TIMESTAMPS,
  company: buildCompany({ name: 'Acme' }),
  invited_by: { id: uuid(8), name: 'Carla Dias', email: 'carla@acme.com' },
  route_permissions: [],
  provider_permissions: [],
  ...overrides,
});

export const buildMcpServer = (overrides: Partial<IRetrieveMcpServer> = {}): IRetrieveMcpServer => ({
  id: uuid(30),
  agent_id: uuid(10),
  agent_name: 'Especialista GA4',
  name: 'CRM interno',
  url: 'https://mcp.acme.com/mcp',
  transport: 'streamable_http',
  auth_type: 'none',
  auth_header_name: null,
  ...TIMESTAMPS,
  ...overrides,
});

export const buildMcpServerTestResult = (
  overrides: Partial<ITestMcpServerResponse> = {},
): ITestMcpServerResponse => ({
  ok: true,
  tools: [
    { name: 'search_contacts', description: 'Busca contatos no CRM' },
    { name: 'create_deal', description: null },
  ],
  error: null,
  ...overrides,
});

export const buildTrackingIdRule = (overrides: Partial<ITrackingIdRule> = {}): ITrackingIdRule => ({
  key: 'ga4_measurement_id',
  constant: 'CONS - GA4 | Measurement ID',
  secret: false,
  optional: false,
  example: 'G-123456789',
  tools: ['ga4'],
  server_only: false,
  format: 'G-XXXXXXXXXX',
  where: 'GA4 > Administrador > Fluxos de dados',
  ...overrides,
});

export const buildTrackingRules = (overrides: Partial<ITrackingRules> = {}): ITrackingRules => ({
  tools: [
    { key: 'ga4', label: 'GA4' },
    { key: 'meta_ads', label: 'Meta Ads' },
  ],
  ids: [
    buildTrackingIdRule(),
    buildTrackingIdRule({
      key: 'meta_pixel_id',
      constant: 'CONS - Meta Ads | Pixel ID',
      example: '123456789',
      tools: ['meta_ads'],
      format: 'só números',
      where: 'Gerenciador de Eventos da Meta',
    }),
    buildTrackingIdRule({
      key: 'meta_capi_token',
      constant: 'CONS - Meta Ads | API Access Token',
      example: 'EAA123',
      secret: true,
      server_only: true,
      tools: ['meta_ads'],
      format: 'começa com EAA',
      where: 'Gerenciador de Eventos > API de Conversões',
    }),
    buildTrackingIdRule({
      key: 'server_container_url',
      constant: 'CONS - Transport URL (Server Container URL)',
      example: 'https://sgtm.exemplo.com.br',
      server_only: true,
      tools: [],
      format: 'https://dominio',
      where: 'GTM server',
    }),
  ],
  banners: ['opt_in', 'opt_out', 'region'],
  modes: ['advanced', 'basic'],
  import_problems: [
    { key: 'no_permission', label: 'Sem acesso de edição ou publicação' },
    { key: 'json_rejected', label: 'O GTM recusou o arquivo JSON' },
  ],
  standard_version: '1.0.0',
  ...overrides,
});

export const buildSiteAnalysis = (overrides: Partial<ISiteAnalysis> = {}): ISiteAnalysis => ({
  url: 'https://www.lojaexemplo.com.br',
  final_url: 'https://www.lojaexemplo.com.br/',
  host: 'www.lojaexemplo.com.br',
  cookie_domain: '.lojaexemplo.com.br',
  reachable: true,
  error: null,
  blocked: false,
  protection: null,
  platform: 'VTEX',
  is_ecommerce: true,
  cmp: 'OneTrust',
  has_datalayer: true,
  gtm_containers: [],
  hardcoded: {},
  inside_gtm: {},
  funnel_domains: [],
  hostnames: ['www.lojaexemplo.com.br'],
  detected_tools: [],
  suggested_ids: { cookie_domain: '.lojaexemplo.com.br' },
  considerations: ['Cookie domain do container: .lojaexemplo.com.br.'],
  hardcoded_warnings: [],
  diagnosis_markdown: '# Diagnóstico do site\n',
  ...overrides,
});

export const buildContainerFile = (overrides: Partial<IContainerFile> = {}): IContainerFile => ({
  file: 'GoTrackin_Web.json',
  content: '{}',
  validation: { ok: true, counts: { tag: 10, trigger: 5, variable: 8 }, issues: [] },
  ...overrides,
});

const purchaseEvent = { event: 'custom_purchase', when: 'Na confirmação do pedido.', required: ['ecommerce.value'], tags: 2 };

export const buildBuildResult = (overrides: Partial<IBuildResult> = {}): IBuildResult => ({
  standard_version: '1.0.0',
  site: buildSiteAnalysis(),
  web: buildContainerFile(),
  server: null,
  merge: null,
  tag_map: { tags: 10, attributes: 8, markdown: '# Mapa de Tags\n', tags_csv: '', attributes_csv: '' },
  datalayer: { events: [purchaseEvent], markdown: '# Mapa de dataLayer\n', csv: '' },
  requirements: { datalayer: [purchaseEvent], accesses: ['Permissão de Publicar no contêiner web do GTM.'] },
  guide: {
    import_steps: [
      { number: 1, title: 'Acesse o Google Tag Manager', text: 'Entre em tagmanager.google.com.', print: '01-acessar-gtm.png', caption: 'Tela inicial.' },
    ],
    publish_steps: [{ number: 2, title: 'Publique', text: 'Clique em Publicar.', print: null, caption: null }],
  },
  document: { file: 'GoTrackin_Documentacao.pdf', content_base64: 'JVBERi0xLjQ=' },
  ...overrides,
});

export const buildPublicationResult = (overrides: Partial<IPublicationResult> = {}): IPublicationResult => ({
  container_id: 'GTM-ABC1234',
  published: true,
  ids: [{ key: 'ga4_measurement_id', label: 'GA4 | Measurement ID', value: 'G-ABC123XYZ9', found: true }],
  missing: [],
  ...overrides,
});

export const buildImportHelp = (overrides: Partial<IImportHelp> = {}): IImportHelp => ({
  kind: 'json_rejected',
  label: 'O GTM recusou o arquivo JSON',
  diagnosis: 'O arquivo chegou ao GTM corrompido.',
  steps: ['Baixe de novo o arquivo no Trackin\' Master.'],
  regenerate: true,
  matched_known_error: true,
  ...overrides,
});
