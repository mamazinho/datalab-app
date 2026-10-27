import type { AssetType, IntegrationKey, Provider } from '../types/integrations';

export const PROVIDER_LABELS: Record<Provider, string> = {
  google: 'Google',
  meta: 'Meta',
};

export const ASSET_TYPE_LABELS: Record<AssetType, string> = {
  ga4_account: 'conta do GA4',
  ga4_property: 'property',
  google_ads_customer: 'conta do Google Ads',
  meta_ad_account: 'ad account',
  meta_page: 'página',
  meta_instagram_account: 'instagram',
};

export const assetTypeLabel = (assetType: string): string =>
  ASSET_TYPE_LABELS[assetType as AssetType] ?? assetType;

// Google scopes are URLs ("…/auth/analytics.edit"); only the last segment means something to a person
export const scopeLabel = (scope: string): string => scope.split('/').filter(Boolean).pop() ?? scope;

// Google Ads and Google Analytics share the google provider, so asset_type tells them apart
const INTEGRATION_ASSET_TYPES: Partial<Record<IntegrationKey, AssetType[]>> = {
  google_analytics: ['ga4_account', 'ga4_property'],
  google_ads: ['google_ads_customer'],
  meta_ads: ['meta_ad_account', 'meta_page', 'meta_instagram_account'],
};

export const assetTypesOfIntegration = (integration: IntegrationKey): AssetType[] =>
  INTEGRATION_ASSET_TYPES[integration] ?? [];

export const belongsToIntegration = (assetType: string, integration: IntegrationKey): boolean =>
  assetTypesOfIntegration(integration).includes(assetType as AssetType);

// A GA4 account is an asset by itself (it allows creating properties) and the parent of its properties
const CONTAINER_ASSET_TYPES: AssetType[] = ['ga4_account'];

export const isContainerAsset = (assetType: string): boolean =>
  CONTAINER_ASSET_TYPES.includes(assetType as AssetType);

export const UNGROUPED_ASSETS_LABEL = 'Sem conta vinculada';

const ASSET_TYPE_GROUP_LABELS: Record<AssetType, string> = {
  ga4_account: 'Contas do GA4',
  ga4_property: 'Properties',
  google_ads_customer: 'Contas do Google Ads',
  meta_ad_account: 'Contas de anúncio',
  meta_page: 'Páginas',
  meta_instagram_account: 'Perfis do Instagram',
};

interface IGroupableAsset {
  asset_type: string;
  external_id: string;
  name: string;
  parent_name: string | null;
}

export interface IAssetGroup<T> {
  key: string;
  label: string;
  container: T | null;
  items: T[];
}

// parent_name is the only link to the account and does not always match its name ("Acme" vs "Acme (conta)")
const normalizeParentKey = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    .replace(/\s*\((conta|account)\)\s*$/i, '');

// Meta assets are a catalog of types, not a tree: the business behind parent_name is often missing
function groupAssetsByType<T extends IGroupableAsset>(assets: T[]): IAssetGroup<T>[] {
  const groups = new Map<string, IAssetGroup<T>>();

  assets.forEach((asset) => {
    const key = asset.asset_type;
    const group = groups.get(key) ?? {
      key,
      label: ASSET_TYPE_GROUP_LABELS[key as AssetType] ?? assetTypeLabel(key),
      container: null,
      items: [],
    };

    group.items.push(asset);
    groups.set(key, group);
  });

  return [...groups.values()];
}

export function groupAssets<T extends IGroupableAsset>(
  assets: T[],
  provider: Provider,
): IAssetGroup<T>[] {
  return provider === 'meta' ? groupAssetsByType(assets) : groupAssetsByContainer(assets);
}

export function groupAssetsByContainer<T extends IGroupableAsset>(assets: T[]): IAssetGroup<T>[] {
  const groups = new Map<string, IAssetGroup<T>>();
  const groupKeyByParent = new Map<string, string>();

  assets
    .filter((asset) => isContainerAsset(asset.asset_type))
    .forEach((container) => {
      const nameKey = normalizeParentKey(container.name);
      // Accounts with the same name are rare; the id keeps both
      const key = groupKeyByParent.has(nameKey) ? container.external_id : nameKey;

      groups.set(key, { key, label: container.name, container, items: [] });
      groupKeyByParent.set(key, key);
      groupKeyByParent.set(container.external_id, key);
    });

  assets
    .filter((asset) => !isContainerAsset(asset.asset_type))
    .forEach((asset) => {
      // A blank parent_name must fall into the ungrouped bucket, not into a group with an empty label
      const parent = asset.parent_name?.trim() || undefined;
      const parentKey = parent
        ? groupKeyByParent.get(normalizeParentKey(parent)) ?? groupKeyByParent.get(parent)
        : undefined;
      const key = parentKey ?? parent ?? UNGROUPED_ASSETS_LABEL;

      const group = groups.get(key) ?? {
        key,
        label: parent ?? UNGROUPED_ASSETS_LABEL,
        container: null,
        items: [],
      };

      group.items.push(asset);
      groups.set(key, group);
    });

  return [...groups.values()];
}
