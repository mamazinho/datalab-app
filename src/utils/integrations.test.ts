import { describe, expect, it } from 'vitest';
import {
  assetTypeLabel,
  assetTypesOfIntegration,
  belongsToIntegration,
  groupAssets,
  groupAssetsByContainer,
  isContainerAsset,
  scopeLabel,
  UNGROUPED_ASSETS_LABEL,
} from './integrations';

interface ITestAsset {
  asset_type: string;
  external_id: string;
  name: string;
  parent_name: string | null;
}

const asset = (overrides: Partial<ITestAsset> = {}): ITestAsset => ({
  asset_type: 'ga4_property',
  external_id: 'prop-1',
  name: 'Property 1',
  parent_name: 'Acme',
  ...overrides,
});

const ga4Account = (name: string, externalId = name) =>
  asset({ asset_type: 'ga4_account', external_id: externalId, name, parent_name: null });

const labelsOf = (groups: { label: string }[]) => groups.map((group) => group.label);

describe('labels', () => {
  it('translates a known asset type', () => {
    expect(assetTypeLabel('ga4_property')).toBe('property');
  });

  it('falls back to the raw type when the backend adds a new one', () => {
    expect(assetTypeLabel('tiktok_account')).toBe('tiktok_account');
  });

  it('keeps only the meaningful tail of a Google scope URL', () => {
    expect(scopeLabel('https://www.googleapis.com/auth/analytics.edit')).toBe('analytics.edit');
  });

  it('leaves a short Meta scope as it is', () => {
    expect(scopeLabel('ads_read')).toBe('ads_read');
  });
});

describe('integration ownership', () => {
  it('separates Google Ads from Google Analytics, which share a provider', () => {
    expect(belongsToIntegration('ga4_property', 'google_analytics')).toBe(true);
    expect(belongsToIntegration('ga4_property', 'google_ads')).toBe(false);
    expect(belongsToIntegration('google_ads_customer', 'google_ads')).toBe(true);
  });

  it('lists the asset types of an integration', () => {
    expect(assetTypesOfIntegration('google_analytics')).toEqual(['ga4_account', 'ga4_property']);
  });

  it('returns nothing for an integration with no assets', () => {
    expect(assetTypesOfIntegration('google_login')).toEqual([]);
  });

  it('knows that only the GA4 account contains other assets', () => {
    expect(isContainerAsset('ga4_account')).toBe(true);
    expect(isContainerAsset('ga4_property')).toBe(false);
  });
});

describe('groupAssetsByContainer', () => {
  it('nests properties under their account', () => {
    const groups = groupAssetsByContainer([
      ga4Account('Acme'),
      asset({ external_id: 'p1', name: 'Site', parent_name: 'Acme' }),
      asset({ external_id: 'p2', name: 'App', parent_name: 'Acme' }),
    ]);

    expect(groups).toHaveLength(1);
    expect(groups[0].container?.name).toBe('Acme');
    expect(groups[0].items.map((item) => item.name)).toEqual(['Site', 'App']);
  });

  it('matches the parent even when the account name carries a suffix', () => {
    const groups = groupAssetsByContainer([
      ga4Account('Acme (conta)'),
      asset({ parent_name: 'Acme' }),
    ]);

    expect(groups).toHaveLength(1);
    expect(groups[0].items).toHaveLength(1);
  });

  it('groups by parent name when the account itself is not listed', () => {
    const groups = groupAssetsByContainer([asset({ parent_name: 'Globex' })]);

    expect(labelsOf(groups)).toEqual(['Globex']);
    expect(groups[0].container).toBeNull();
  });

  it('collects orphan assets under a single labelled group', () => {
    const groups = groupAssetsByContainer([
      asset({ external_id: 'p1', parent_name: null }),
      asset({ external_id: 'p2', parent_name: '   ' }),
    ]);

    expect(labelsOf(groups)).toEqual([UNGROUPED_ASSETS_LABEL]);
    expect(groups[0].items).toHaveLength(2);
  });

  it('keeps homonym accounts apart by their id', () => {
    const groups = groupAssetsByContainer([
      ga4Account('Acme', 'acc-1'),
      ga4Account('Acme', 'acc-2'),
    ]);

    expect(groups).toHaveLength(2);
  });

  it('keeps an account with no properties as an empty group', () => {
    const groups = groupAssetsByContainer([ga4Account('Acme')]);

    expect(groups[0].items).toEqual([]);
    expect(groups[0].container?.name).toBe('Acme');
  });
});

describe('groupAssets', () => {
  it('groups Meta assets by type, since there is no real hierarchy there', () => {
    const groups = groupAssets(
      [
        asset({ asset_type: 'meta_page', external_id: 'pg-1', name: 'Página', parent_name: 'BM' }),
        asset({ asset_type: 'meta_instagram_account', external_id: 'ig-1', name: 'Página', parent_name: 'BM' }),
        asset({ asset_type: 'meta_ad_account', external_id: 'ad-1', name: 'Conta', parent_name: null }),
      ],
      'meta',
    );

    expect(labelsOf(groups)).toEqual(['Páginas', 'Perfis do Instagram', 'Contas de anúncio']);
  });

  it('groups Google assets by their container account', () => {
    const groups = groupAssets([ga4Account('Acme'), asset({ parent_name: 'Acme' })], 'google');

    expect(groups).toHaveLength(1);
    expect(groups[0].container?.name).toBe('Acme');
  });
});
