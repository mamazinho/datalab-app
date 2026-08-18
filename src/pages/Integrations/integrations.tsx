import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useQueryClient } from '@tanstack/react-query';
import { QueryBoundary } from '../../components/Tools/query-boundary';
import { useCompanyContext, useCompanyPermissions } from '../../contexts/company';
import { useIntegrations } from '../../hooks/use-integrations';
import { integrationsQuery } from '../../queries';
import { DatalabAPI } from '../../services/datalab-api';
import type { IIntegrationStatus } from '../../services/datalab-api/authResource';
import type { UUID } from '../../types/ids';
import type { IntegrationKey } from '../../types/integrations';
import { belongsToIntegration, PROVIDER_LABELS } from '../../utils/integrations';
import { IntegrationCard } from './components/integration-card';
import { ProviderAssetsModal } from './components/provider-assets-modal';
import { useConnectIntegration } from './use-connect-integration';
import {
  IntegrationsEmpty,
  IntegrationsGrid,
  IntegrationsPageContainer,
  IntegrationsPageHeader,
  IntegrationsPageSubtitle,
  IntegrationsPageTitle,
} from './integrations.style';

// O callback da integração volta para cá pedindo a seleção de ativos daquela
// integração (?ativos=google_analytics).
const ASSETS_PARAM = 'ativos';

const IntegrationsContent = ({ companyId }: { companyId: UUID }) => {
  const queryClient = useQueryClient();
  const { data: integrations } = useIntegrations();
  const { companyProviderAssets } = useCompanyContext();
  const { isOwner } = useCompanyPermissions();
  const [searchParams, setSearchParams] = useSearchParams();
  const [assetsIntegration, setAssetsIntegration] = useState<IIntegrationStatus | null>(null);
  const [disconnectingKey, setDisconnectingKey] = useState<IntegrationKey | null>(null);

  // Integrações de login não aparecem aqui: elas se resolvem na tela de login.
  const connectable = useMemo(() => integrations.filter((i) => !i.is_login), [integrations]);

  // Emenda a seleção de ativos logo após o consentimento — é o único momento em
  // que o owner tem fresco o contexto do que acabou de autorizar.
  const openAssetsFor = useCallback(
    (key: IntegrationKey) => {
      const target = connectable.find((i) => i.key === key);
      if (target && isOwner) setAssetsIntegration(target);
    },
    [connectable, isOwner],
  );

  // Só emenda a seleção quando a empresa ainda não tem ativos desta integração:
  // é o caso que deixaria a empresa com acesso zero. Numa reconexão (token
  // expirado, escopo novo) a allowlist continua lá — reabrir o modal seria ruído.
  const handleConnected = useCallback(
    (key: IntegrationKey) => {
      const alreadyConfigured = companyProviderAssets.some((asset) =>
        belongsToIntegration(asset.asset_type, key),
      );

      if (!alreadyConfigured) openAssetsFor(key);
    },
    [companyProviderAssets, openAssetsFor],
  );

  const { connect, connectingKey } = useConnectIntegration({ onConnected: handleConnected });

  // Caminho sem popup: o callback volta pela aba principal com ?ativos=
  const requestedAssets = searchParams.get(ASSETS_PARAM);

  useEffect(() => {
    if (!requestedAssets) return;

    handleConnected(requestedAssets as IntegrationKey);
    setSearchParams({}, { replace: true });
  }, [requestedAssets, handleConnected, setSearchParams]);

  const assetsOf = useCallback(
    (integration: IIntegrationStatus) =>
      companyProviderAssets.filter((asset) => belongsToIntegration(asset.asset_type, integration.key)),
    [companyProviderAssets],
  );

  const handleDisconnect = useCallback(
    async (integration: IIntegrationStatus) => {
      const providerLabel = PROVIDER_LABELS[integration.provider];
      const affected = connectable
        .filter((i) => i.provider === integration.provider && i.connected)
        .map((i) => i.label)
        .join(', ');

      const confirmed = window.confirm(
        `Desconectar sua conta ${providerLabel} remove TODAS as integrações dela` +
          `${affected ? ` (${affected})` : ''}. Os ativos liberados para a empresa continuam salvos, ` +
          'mas ninguém consegue operá-los pela sua conta até você reconectar. Continuar?',
      );
      if (!confirmed) return;

      setDisconnectingKey(integration.key);
      try {
        await DatalabAPI.AuthResource.disconnectProvider(integration.provider);
        toast.success(`Conta ${providerLabel} desconectada.`);
        void queryClient.invalidateQueries({ queryKey: integrationsQuery.queryKey });
      } catch (e: unknown) {
        toast.error(e instanceof Error ? e.message : 'Não foi possível desconectar.');
      } finally {
        setDisconnectingKey(null);
      }
    },
    [connectable, queryClient],
  );

  if (connectable.length === 0) {
    return <IntegrationsEmpty>Nenhuma integração disponível no momento.</IntegrationsEmpty>;
  }

  return (
    <>
      <IntegrationsGrid>
        {connectable.map((integration) => (
          <IntegrationCard
            key={integration.key}
            integration={integration}
            assets={assetsOf(integration)}
            isOwner={isOwner}
            isBusy={connectingKey === integration.key || disconnectingKey === integration.key}
            onConnect={(value) => void connect(value)}
            onDisconnect={(value) => void handleDisconnect(value)}
            onManageAssets={setAssetsIntegration}
          />
        ))}
      </IntegrationsGrid>

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
    <IntegrationsPageContainer>
      <IntegrationsPageHeader>
        <div>
          <IntegrationsPageTitle>Integrações</IntegrationsPageTitle>
          <IntegrationsPageSubtitle>
            Conecte suas contas Google e Meta e defina quais ativos de cada uma pertencem a{' '}
            {currentCompany.name}. A conexão é da sua conta; os ativos liberados valem para
            toda a empresa.
          </IntegrationsPageSubtitle>
        </div>
      </IntegrationsPageHeader>

      <QueryBoundary>
        <IntegrationsContent companyId={currentCompany.id} />
      </QueryBoundary>
    </IntegrationsPageContainer>
  );
};
