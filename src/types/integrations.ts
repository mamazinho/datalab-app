
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

// ProviderPermissionKey mirror
export type ProviderPermissionKey =
  | 'ga4_account_create'
  | 'ga4_property_create'
  | 'google_ads_campaign_create'
  | 'google_ads_ad_group_create'
  | 'google_ads_ad_create'
  | 'google_ads_campaign_update'
  | 'google_ads_budget_update'
  | 'meta_campaign_create'
  | 'meta_ad_set_create'
  | 'meta_ad_create'
  | 'meta_campaign_update'
  | 'meta_budget_update';

export const PROVIDERS: Provider[] = ['google', 'meta'];

export const isProvider = (value: unknown): value is Provider =>
  typeof value === 'string' && (PROVIDERS as string[]).includes(value);
