import styles from '../integrations.module.css';
import { useCallback } from 'react';
import type { IProviderAsset } from '../../../services/datalab-api/companiesResource';
import { assetTypeLabel, groupAssets, type IAssetGroup } from '../../../utils/integrations';
import type { Provider } from '../../../types/integrations';

interface IAssetsSelectorProps {
  assets: IProviderAsset[];
  provider: Provider;
  selected: Set<string>;
  onChange: (selected: Set<string>) => void;
}

const ACCOUNT_HINT = 'Liberar esta conta permite que o agente crie novas propriedades nela';

interface IAssetGroupItemProps {
  group: IAssetGroup<IProviderAsset>;
  selected: Set<string>;
  onToggleAsset: (externalId: string) => void;
  onToggleContainer: (group: IAssetGroup<IProviderAsset>) => void;
  onToggleItems: (items: IProviderAsset[]) => void;
}

const AssetGroupItem = ({
  group,
  selected,
  onToggleAsset,
  onToggleContainer,
  onToggleItems,
}: IAssetGroupItemProps) => {
  const isContainerSelected = group.container ? selected.has(group.container.external_id) : false;
  const hasSelectedItems = group.items.some((asset) => selected.has(asset.external_id));
  const allItemsSelected = group.items.length > 0 && group.items.every((asset) => selected.has(asset.external_id));

  // A group with an account opens when the account is allowed or something inside is checked, so a selection is never hidden
  const showItems = !group.container || isContainerSelected || hasSelectedItems;

  return (
    <section className={styles.assetGroup} data-selected={isContainerSelected || hasSelectedItems}>
      {group.container ? (
        <label className={styles.assetGroupHeader} data-selected={isContainerSelected} htmlFor={`asset-${group.container.external_id}`}>
          <div className={styles.assetGroupHeading}>
            <input
              id={`asset-${group.container.external_id}`}
              type="checkbox"
              checked={isContainerSelected}
              onChange={() => onToggleContainer(group)}
            />
            <div className={styles.assetInfo}>
              <span className={styles.assetName}>{group.label}</span>
              <span className={styles.assetDetails}>
                <span className={styles.assetTypeTag}>{assetTypeLabel(group.container.asset_type)}</span>
                <code className={styles.assetExternalId}>{group.container.external_id}</code>
              </span>
              <span className={styles.assetDetails}>{ACCOUNT_HINT}</span>
            </div>
          </div>
        </label>
      ) : (
        <div className={styles.assetGroupHeader} data-selected={hasSelectedItems}>
          <div className={styles.assetGroupHeading}>
            <span className={styles.assetGroupName}>{group.label}</span>
          </div>
          {group.items.length > 0 && (
            <button className={styles.assetGroupToggle} type="button" onClick={() => onToggleItems(group.items)}>
              {allItemsSelected ? 'Limpar' : 'Selecionar tudo'}
            </button>
          )}
        </div>
      )}

      {showItems && (
        <div className={styles.assetGroupBody}>
          {group.items.length === 0 ? (
            <p className={styles.assetGroupEmpty}>Nenhum ativo dentro desta conta.</p>
          ) : (
            <>
              {group.container && (
                <p className={styles.assetGroupBodyCaption}>
                  Confirme as properties que você quer liberar nesta conta.
                  <button className={styles.assetGroupToggle} type="button" onClick={() => onToggleItems(group.items)}>
                    {allItemsSelected ? 'Limpar' : 'Selecionar tudo'}
                  </button>
                </p>
              )}

              <div className={styles.assetGroupItems}>
                {group.items.map((asset) => (
                  <label className={styles.assetRow} key={asset.external_id} htmlFor={`asset-${asset.external_id}`}>
                    <div className={styles.assetInfo}>
                      <span className={styles.assetName}>{asset.name}</span>
                      <span className={styles.assetDetails}>
                        <span className={styles.assetTypeTag}>{assetTypeLabel(asset.asset_type)}</span>
                        {/* Names repeat across clients; the id tells them apart */}
                        <code className={styles.assetExternalId}>{asset.external_id}</code>
                      </span>
                    </div>
                    <input
                      id={`asset-${asset.external_id}`}
                      type="checkbox"
                      checked={selected.has(asset.external_id)}
                      onChange={() => onToggleAsset(asset.external_id)}
                    />
                  </label>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </section>
  );
};

export const AssetsSelector = ({ assets, provider, selected, onChange }: IAssetsSelectorProps) => {
  const groups = groupAssets(assets, provider);

  const toggleAsset = useCallback(
    (externalId: string) => {
      const next = new Set(selected);
      if (next.has(externalId)) next.delete(externalId);
      else next.add(externalId);
      onChange(next);
    },
    [selected, onChange],
  );

  // The account drives its group: checking it checks everything inside, unchecking it clears them
  const toggleContainer = useCallback(
    (group: IAssetGroup<IProviderAsset>) => {
      if (!group.container) return;

      const next = new Set(selected);
      const willSelect = !next.has(group.container.external_id);

      if (willSelect) {
        next.add(group.container.external_id);
        group.items.forEach((asset) => next.add(asset.external_id));
      } else {
        next.delete(group.container.external_id);
        group.items.forEach((asset) => next.delete(asset.external_id));
      }

      onChange(next);
    },
    [selected, onChange],
  );

  const toggleItems = useCallback(
    (items: IProviderAsset[]) => {
      const next = new Set(selected);
      const allSelected = items.every((asset) => next.has(asset.external_id));
      items.forEach((asset) =>
        allSelected ? next.delete(asset.external_id) : next.add(asset.external_id),
      );
      onChange(next);
    },
    [selected, onChange],
  );

  return (
    <div className={styles.assetsList}>
      {groups.map((group) => (
        <AssetGroupItem
          key={group.key}
          group={group}
          selected={selected}
          onToggleAsset={toggleAsset}
          onToggleContainer={toggleContainer}
          onToggleItems={toggleItems}
        />
      ))}
    </div>
  );
};
