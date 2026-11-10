import styles from './integrations.module.css';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { QueryBoundary } from '../../components/Tools/query-boundary';
import { useCompanyContext } from '../../contexts/company';
import { useConfirm } from '../../contexts/confirm';
import { useIntegrations } from '../../hooks/use-integrations';
import { integrationsQuery } from '../../queries';
import { DatalabAPI } from '../../services/datalab-api';
import type { IIntegrationStatus } from '../../services/datalab-api/authResource';
import type { UUID7 } from '../../types/ids';
import type { IntegrationKey } from '../../types/integrations';
import { belongsToIntegration, PROVIDER_LABELS } from '../../utils/integrations';
import { IntegrationCard } from './components/integration-card';
import { ProviderAssetsModal } from './components/provider-assets-modal';
import { useConnectIntegration } from './use-connect-integration';
import { useRowActions } from '../../hooks/use-row-actions';

const ASSETS_PARAM = 'ativos';

const IntegrationsContent = ({ companyId }: { companyId: UUID7 }) => {
  const confirm = useConfirm();
  const { data: integrations } = useIntegrations();
  const { companyProviderAssets, isOwner } = useCompanyContext();
  const [searchParams, setSearchParams] = useSearchParams();
  const { isBusy: isDisconnecting, run } = useRowActions(integrationsQuery.queryKey);

  const connectable = integrations.filter((i) => !i.is_login);

  // Opens the asset picker only while the company has no asset of this integration; a reconnection keeps the allowlist
  const assetPickerFor = (key: string | null): IIntegrationStatus | null => {
    const target = connectable.find((i) => i.key === key);
    const alreadyConfigured = companyProviderAssets.some((asset) => belongsToIntegration(asset.asset_type, key as IntegrationKey));
    return target && isOwner && !alreadyConfigured ? target : null;
  };

  // Without the popup, the callback comes back to this tab with ?ativos=
  const [assetsIntegration, setAssetsIntegration] = useState(() => assetPickerFor(searchParams.get(ASSETS_PARAM)));

  useEffect(() => {
    if (searchParams.has(ASSETS_PARAM)) setSearchParams({}, { replace: true });
  }, [searchParams, setSearchParams]);

  const handleConnected = (key: IntegrationKey) => {
    const picker = assetPickerFor(key);
    if (picker) setAssetsIntegration(picker);
  };

  const { connect, connectingKey } = useConnectIntegration({ onConnected: handleConnected });

  const assetsOf = (integration: IIntegrationStatus) =>
    companyProviderAssets.filter((asset) => belongsToIntegration(asset.asset_type, integration.key));

  const handleDisconnect = async (integration: IIntegrationStatus) => {
    const providerLabel = PROVIDER_LABELS[integration.provider];
    const affected = connectable
      .filter((i) => i.provider === integration.provider && i.connected)
      .map((i) => i.label)
      .join(', ');

    const confirmed = await confirm({
      title: `Desconectar ${providerLabel}`,
      message:
        `Desconectar sua conta ${providerLabel} remove TODAS as integrações dela` +
        `${affected ? ` (${affected})` : ''}. Os ativos liberados para a empresa continuam salvos, ` +
        'mas ninguém consegue operá-los pela sua conta até você reconectar.',
      confirmLabel: 'Desconectar',
    });
    if (!confirmed) return;

    run({
      id: integration.key,
      request: () => DatalabAPI.AuthResource.disconnectProvider(integration.provider),
      successMessage: `Conta ${providerLabel} desconectada.`,
    });
  };

  if (connectable.length === 0) {
    return <p className={styles.integrationsEmpty}>Nenhuma integração disponível no momento.</p>;
  }

  return (
    <>
      <div className={styles.integrationsGrid}>
        {connectable.map((integration) => (
          <IntegrationCard
            key={integration.key}
            integration={integration}
            assets={assetsOf(integration)}
            isOwner={isOwner}
            isBusy={connectingKey === integration.key || isDisconnecting(integration.key)}
            onConnect={(value) => void connect(value)}
            onDisconnect={(value) => void handleDisconnect(value)}
            onManageAssets={setAssetsIntegration}
          />
        ))}
      </div>

      <ProviderAssetsModal
        isOpen={assetsIntegration !== null}
        onClose={() => setAssetsIntegration(null)}
        companyId={companyId}
        integration={assetsIntegration}
      />
    </>
  );
};

export const Integrations = () => {
  const { currentCompany } = useCompanyContext();

  if (!currentCompany) return null;

  return (
    <div className={styles.integrationsPageContainer}>
      <div className={styles.integrationsPageHeader}>
        <div>
          <h1 className={styles.integrationsPageTitle}>Integrações</h1>
          <p className={styles.integrationsPageSubtitle}>
            Conecte suas contas Google e Meta e defina quais ativos de cada uma pertencem a{' '}
            {currentCompany.name}. A conexão é da sua conta; os ativos liberados valem para
            toda a empresa.
          </p>
        </div>
      </div>

      <QueryBoundary>
        <IntegrationsContent companyId={currentCompany.id} />
      </QueryBoundary>
    </div>
  );
};
