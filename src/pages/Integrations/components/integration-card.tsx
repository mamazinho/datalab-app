import styles from '../integrations.module.css';
import { useId, type ReactNode } from 'react';
import type { IIntegrationStatus } from '../../../services/datalab-api/authResource';
import type { ICompanyProviderAsset } from '../../../services/datalab-api/companiesResource';
import { groupAssets, PROVIDER_LABELS, scopeLabel } from '../../../utils/integrations';

interface IIntegrationCardProps {
  integration: IIntegrationStatus;
  assets: ICompanyProviderAsset[];
  isOwner: boolean;
  isBusy: boolean;
  onConnect: (integration: IIntegrationStatus) => void;
  onDisconnect: (integration: IIntegrationStatus) => void;
  onManageAssets: (integration: IIntegrationStatus) => void;
}

const isExpired = (value: string | null) => !!value && new Date(value).getTime() <= Date.now();

export const IntegrationCard = ({
  integration,
  assets,
  isOwner,
  isBusy,
  onConnect,
  onDisconnect,
  onManageAssets,
}: IIntegrationCardProps) => {
  const expired = isExpired(integration.token_expires_at);
  const providerLabel = PROVIDER_LABELS[integration.provider];
  const assetGroups = groupAssets(assets, integration.provider);
  const missingScopes = integration.missing_scopes ?? [];
  // connected means the consent happened, even if incomplete: missing scopes call for completing it, not reconnecting
  const needsScopes = integration.connected && missingScopes.length > 0;
  const tooltipId = useId();

  const alerts: ReactNode[] = [];

  if (integration.connected && assets.length === 0) {
    alerts.push(
      <>
        Esta empresa ainda não pode operar o {integration.label}.
        {isOwner
          ? ' Escolha os ativos que pertencem a ela.'
          : ' Peça ao owner da empresa para liberar os ativos.'}
      </>,
    );
  }

  if (needsScopes) {
    alerts.push(
      <>
        A conexão com o {providerLabel} está ativa, mas estas permissões ainda não foram
        concedidas para esta integração:
        <div className={styles.scopeList}>
          {missingScopes.map((scope) => (
            <code className={styles.scopeChip} key={scope} title={scope}>
              {scopeLabel(scope)}
            </code>
          ))}
        </div>
      </>,
    );
  }

  return (
    <article className={styles.integrationCardBox} data-connected={integration.connected}>
      <header className={styles.integrationCardHead}>
        <div>
          <h2 className={styles.integrationName}>{integration.label}</h2>
          <span className={styles.integrationProviderTag}>{providerLabel}</span>
        </div>

        <div className={styles.integrationCardStatus}>
          {alerts.length > 0 && (
            <span className={styles.integrationAlert}>
              <button className={styles.integrationAlertIcon}
                type="button"
                aria-label={`Avisos de ${integration.label}`}
                aria-describedby={tooltipId}
              >
                !
              </button>
              <span className={styles.integrationAlertTooltip} id={tooltipId} role="tooltip">
                <span className={styles.integrationAlertList}>
                  {alerts.map((alert, index) => (
                    <span key={index}>{alert}</span>
                  ))}
                </span>
              </span>
            </span>
          )}

          <span className={styles.statusBadge}
            data-tone={!integration.connected ? 'neutral' : expired || needsScopes ? 'warning' : 'success'}
          >
            {!integration.connected
              ? 'Não conectado'
              : expired
                ? 'Token expirado'
                : needsScopes
                  ? 'Permissões incompletas'
                  : 'Conectado'}
          </span>
        </div>
      </header>

      <p className={styles.integrationDescription}>{integration.description}</p>

      {integration.connected_account_email && (
        <dl className={styles.integrationMeta}>
          <div className={styles.integrationMetaRow}>
            <dt>Conta:</dt>
            <dd>{integration.connected_account_email}</dd>
          </div>
        </dl>
      )}

      {assetGroups.length > 0 && (
        <div className={styles.assetSummary}>
          <span className={styles.assetSummaryTitle}>Ativos da empresa ({assets.length})</span>
          {assetGroups.map((group) => (
            <div className={styles.assetSummaryGroup} key={group.key}>
              <span className={styles.assetSummaryAccount}>{group.label}</span>
              {group.items.length > 0 && (
                <ul className={styles.assetSummaryItems}>
                  {group.items.map((asset) => (
                    <li className={styles.assetSummaryItem} key={asset.external_id} title={asset.external_id}>
                      {asset.name}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      <div className={styles.integrationActions}>
        {integration.connected ? (
          <>
            {isOwner && (
              <button className={styles.integrationPrimaryButton} type="button" onClick={() => onManageAssets(integration)}>
                Gerenciar permissões
              </button>
            )}
            <button className={styles.integrationButton}
              type="button"
              disabled={isBusy}
              onClick={() => onConnect(integration)}
            >
              {isBusy ? 'Abrindo...' : needsScopes ? 'Completar permissões' : 'Reconectar'}
            </button>
            <button className={styles.integrationDangerButton}
              type="button"
              disabled={isBusy}
              onClick={() => onDisconnect(integration)}
            >
              Desconectar
            </button>
          </>
        ) : (
          <button className={styles.integrationPrimaryButton}
            type="button"
            disabled={isBusy}
            onClick={() => onConnect(integration)}
          >
            {isBusy ? 'Abrindo...' : 'Conectar'}
          </button>
        )}
      </div>
    </article>
  );
};
