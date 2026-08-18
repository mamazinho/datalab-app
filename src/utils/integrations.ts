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

// Escopo do Google vem como URL ("…/auth/analytics.edit"); o Meta já vem curto.
// Só o trecho final identifica a permissão para quem lê.
export const scopeLabel = (scope: string): string => scope.split('/').filter(Boolean).pop() ?? scope;

// Google Ads e Google Analytics dividem provider: "google", então a allowlist
// salva vem misturada. É o asset_type que diz de qual integração cada ativo é.
const INTEGRATION_ASSET_TYPES: Partial<Record<IntegrationKey, AssetType[]>> = {
  google_analytics: ['ga4_account', 'ga4_property'],
  google_ads: ['google_ads_customer'],
  meta_ads: ['meta_ad_account', 'meta_page', 'meta_instagram_account'],
};

export const assetTypesOfIntegration = (integration: IntegrationKey): AssetType[] =>
  INTEGRATION_ASSET_TYPES[integration] ?? [];

export const belongsToIntegration = (assetType: string, integration: IntegrationKey): boolean =>
  assetTypesOfIntegration(integration).includes(assetType as AssetType);

// Ativos que CONTÊM outros: a conta do GA4 é um ativo por si só (liberá-la
// permite criar properties dentro dela) e ao mesmo tempo é o pai das properties.
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
  /** O ativo que É o grupo (a conta do GA4), quando a listagem o traz */
  container: T | null;
  items: T[];
}

/**
 * O único vínculo que a API expõe entre property e conta é o `parent_name`, e
 * ele nem sempre bate letra a letra com o `name` da conta ("Acme" x "Acme
 * (conta)"). Normalizar evita que uma diferença cosmética quebre a hierarquia.
 */
const normalizeParentKey = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    .replace(/\s*\((conta|account)\)\s*$/i, '');

/**
 * Monta a hierarquia real da listagem: contas viram os grupos e as properties
 * entram dentro da sua. Sem conta correspondente, o grupo é o próprio
 * `parent_name` — nunca um balde genérico com conta e property no mesmo nível.
 */
/**
 * No Meta o `parent_name` é o Business Manager, que muitas vezes não existe — aí páginas
 * ficam órfãs e o Instagram herda o nome da página, produzindo grupo e filho homônimos.
 * Como lá os ativos são um catálogo de tipos, e não uma árvore, o tipo é o agrupamento.
 */
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
  // Índice de busca do filho: aceita tanto o nome (normalizado) quanto o id.
  const groupKeyByParent = new Map<string, string>();

  assets
    .filter((asset) => isContainerAsset(asset.asset_type))
    .forEach((container) => {
      const nameKey = normalizeParentKey(container.name);
      // Contas homônimas são raras; o id desempata sem perder nenhuma.
      const key = groupKeyByParent.has(nameKey) ? container.external_id : nameKey;

      groups.set(key, { key, label: container.name, container, items: [] });
      groupKeyByParent.set(key, key);
      groupKeyByParent.set(container.external_id, key);
    });

  assets
    .filter((asset) => !isContainerAsset(asset.asset_type))
    .forEach((asset) => {
      const parent = asset.parent_name?.trim();
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
