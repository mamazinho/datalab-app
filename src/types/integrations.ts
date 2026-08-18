// Vocabulário compartilhado das integrações OAuth (login + conexões de provider).
// Vive em /types porque services, contexts e páginas dependem dos mesmos literais.

export type Provider = 'google' | 'meta';

export type IntegrationKey =
  | 'google_login'
  | 'google_analytics'
  | 'google_ads'
  | 'meta_login'
  | 'meta_ads';

export type AssetType =
  | 'ga4_account'
  | 'ga4_property'
  | 'google_ads_customer'
  | 'meta_ad_account'
  | 'meta_page'
  | 'meta_instagram_account';

// Tools de escrita que o agente pode executar por uma pessoa no provider —
// espelha o enum ProviderPermissionKey do backend.
export type ProviderPermissionKey = 'ga4_account_create' | 'ga4_property_create';

export const PROVIDERS: Provider[] = ['google', 'meta'];

export const isProvider = (value: unknown): value is Provider =>
  typeof value === 'string' && (PROVIDERS as string[]).includes(value);
