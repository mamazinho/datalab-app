import { DatalabAPI } from '../../services/datalab-api';
import type {
  ICompanyProviderAsset,
  IProviderAsset,
} from '../../services/datalab-api/companiesResource';
import type { UUID7 } from '../../types/ids';
import type { IntegrationKey, Provider } from '../../types/integrations';
import { belongsToIntegration } from '../../utils/integrations';
import { createFormAction } from '../../utils/create-form-action';
import { saveProviderAssetsSchema } from './schemas';

interface ISaveProviderAssetsParams {
  companyId: UUID7;
  provider: Provider;
  integration: IntegrationKey;
  available: IProviderAsset[];
  saved: ICompanyProviderAsset[];
  allowedExternalIds: string[];
}

export interface ISaveProviderAssetsResult {
  added: number;
  removed: number;
}

interface IProviderAssetsDiffParams {
  integration: IntegrationKey;
  available: IProviderAsset[];
  saved: ICompanyProviderAsset[];
  allowedExternalIds: string[];
  selected: Set<string>;
}

// Removals only reach visible assets of this integration (Google Ads and Analytics share a provider),
// so a saved asset the account no longer sees never disappears by omission
export const diffProviderAssets = ({
  integration,
  available,
  saved,
  allowedExternalIds,
  selected,
}: IProviderAssetsDiffParams) => {
  const allowed = new Set(allowedExternalIds);
  const visible = new Set(available.map((asset) => asset.external_id));

  return {
    toAdd: available.filter(
      (asset) => selected.has(asset.external_id) && !allowed.has(asset.external_id),
    ),
    toRemove: saved.filter(
      (asset) =>
        belongsToIntegration(asset.asset_type, integration) &&
        visible.has(asset.external_id) &&
        !selected.has(asset.external_id),
    ),
  };
};

export const createSaveProviderAssetsAction = ({
  companyId,
  provider,
  integration,
  available,
  saved,
  allowedExternalIds,
}: ISaveProviderAssetsParams) =>
  createFormAction(
    saveProviderAssetsSchema,
    async ({ external_ids }): Promise<ISaveProviderAssetsResult> => {
      const { toAdd, toRemove } = diffProviderAssets({
        integration,
        available,
        saved,
        allowedExternalIds,
        selected: new Set(external_ids),
      });

      for (const asset of toAdd) {
        await DatalabAPI.CompaniesResource.addProviderAsset(companyId, {
          provider,
          asset: {
            asset_type: asset.asset_type,
            external_id: asset.external_id,
            name: asset.name,
            parent_name: asset.parent_name,
            extra: asset.extra,
          },
        });
      }

      for (const asset of toRemove) {
        await DatalabAPI.CompaniesResource.removeProviderAsset(companyId, asset.id);
      }

      return { added: toAdd.length, removed: toRemove.length };
    },
    {
      // One "assets" input per checked asset; Object.fromEntries would keep only the last one
      mapFormData: (formData) => ({ external_ids: formData.getAll('assets') }),
      errorPrefix: 'Falha ao salvar os ativos: ',
    },
  );
