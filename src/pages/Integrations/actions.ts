import { DatalabAPI } from '../../services/datalab-api';
import type {
  ICompanyProviderAsset,
  IProviderAsset,
} from '../../services/datalab-api/companiesResource';
import type { UUID } from '../../types/ids';
import type { IntegrationKey, Provider } from '../../types/integrations';
import { belongsToIntegration } from '../../utils/integrations';
import { createFormAction } from '../../utils/create-form-action';
import { saveProviderAssetsSchema } from './schemas';

interface ISaveProviderAssetsParams {
  companyId: UUID;
  provider: Provider;
  integration: IntegrationKey;
  /** Ativos que a conta conectada enxerga (fonte do POST) */
  available: IProviderAsset[];
  /** Allowlist salva da empresa (fonte do id para o DELETE) */
  saved: ICompanyProviderAsset[];
  /** external_ids já liberados, como vieram de available/ */
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

/**
 * Diff da allowlist contra o que já estava liberado. Duas restrições importam:
 * remoções só alcançam ativos DESTA integração (google_ads e google_analytics
 * dividem o provider "google") e que estejam visíveis na lista — um ativo salvo
 * que a conta não enxerga mais não aparece na tela e não pode sumir por omissão.
 */
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

/**
 * Salva a allowlist item a item: um POST por ativo recém-marcado e um DELETE
 * por desmarcado. Diferente de um "substitui tudo", nada é apagado por engano.
 */
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
      // O formulário manda um input "assets" por ativo marcado — o
      // Object.fromEntries padrão colapsaria os repetidos em um valor só.
      mapFormData: (formData) => ({ external_ids: formData.getAll('assets') }),
      errorPrefix: 'Falha ao salvar os ativos: ',
    },
  );
