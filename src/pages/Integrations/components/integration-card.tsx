import { useId, type ReactNode } from 'react';
import type { IIntegrationStatus } from '../../../services/datalab-api/authResource';
import type { ICompanyProviderAsset } from '../../../services/datalab-api/companiesResource';
import { groupAssets, PROVIDER_LABELS, scopeLabel } from '../../../utils/integrations';
import {
  AssetSummary,
  AssetSummaryAccount,
  AssetSummaryGroup,
  AssetSummaryItem,
  AssetSummaryItems,
  AssetSummaryTitle,
  IntegrationActions,
  IntegrationAlert,
  IntegrationAlertIcon,
  IntegrationAlertList,
  IntegrationAlertTooltip,
  IntegrationButton,
  IntegrationCardBox,
  IntegrationCardHead,
  IntegrationCardStatus,
  IntegrationDangerButton,
  IntegrationDescription,
  IntegrationMeta,
  IntegrationMetaRow,
  IntegrationName,
  IntegrationPrimaryButton,
  IntegrationProviderTag,
  ScopeChip,
  ScopeList,
  StatusBadge,
} from '../integrations.style';

interface IIntegrationCardProps {
  integration: IIntegrationStatus;
  /** Ativos desta integração que já estão liberados para a empresa */
  assets: ICompanyProviderAsset[];
  isOwner: boolean;
  isBusy: boolean;
  onConnect: (integration: IIntegrationStatus) => void;
  onDisconnect: (integration: IIntegrationStatus) => void;
  onManageAssets: (integration: IIntegrationStatus) => void;
}

const formatDate = (value: string) => new Date(value).toLocaleDateString('pt-BR');

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
  // Campo opcional na prática: uma resposta sem ele não pode derrubar o card.
  const missingScopes = integration.missing_scopes ?? [];
  // `connected` = já passou pelo consentimento desta integração, mesmo que
  // incompleto. Com escopo faltando o caminho é completar, não reconectar do zero.
  const needsScopes = integration.connected && missingScopes.length > 0;
  const tooltipId = useId();

  // Avisos moram atrás do "!" do cabeçalho: sinalizam sem disputar espaço com o
  // conteúdo do card. Quem quiser o detalhe passa o mouse ou foca pelo teclado.
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
        <ScopeList>
          {missingScopes.map((scope) => (
            <ScopeChip key={scope} title={scope}>
              {scopeLabel(scope)}
            </ScopeChip>
          ))}
        </ScopeList>
      </>,
    );
  }

  return (
    <IntegrationCardBox $connected={integration.connected}>
      <IntegrationCardHead>
        <div>
          <IntegrationName>{integration.label}</IntegrationName>
          <IntegrationProviderTag>{providerLabel}</IntegrationProviderTag>
        </div>

        <IntegrationCardStatus>
          {alerts.length > 0 && (
            <IntegrationAlert>
              <IntegrationAlertIcon
                type="button"
                aria-label={`Avisos de ${integration.label}`}
                aria-describedby={tooltipId}
              >
                !
              </IntegrationAlertIcon>
              <IntegrationAlertTooltip id={tooltipId} role="tooltip">
                <IntegrationAlertList>
                  {alerts.map((alert, index) => (
                    <span key={index}>{alert}</span>
                  ))}
                </IntegrationAlertList>
              </IntegrationAlertTooltip>
            </IntegrationAlert>
          )}

          <StatusBadge
            $tone={!integration.connected ? 'neutral' : expired || needsScopes ? 'warning' : 'success'}
          >
            {!integration.connected
              ? 'Não conectado'
              : expired
                ? 'Token expirado'
                : needsScopes
                  ? 'Permissões incompletas'
                  : 'Conectado'}
          </StatusBadge>
        </IntegrationCardStatus>
      </IntegrationCardHead>

      <IntegrationDescription>{integration.description}</IntegrationDescription>

      {(integration.connected_account_email || integration.token_expires_at) && (
        <IntegrationMeta>
          {integration.connected_account_email && (
            <IntegrationMetaRow>
              <dt>Conta:</dt>
              <dd>{integration.connected_account_email}</dd>
            </IntegrationMetaRow>
          )}
          {integration.token_expires_at && (
            <IntegrationMetaRow>
              <dt>{expired ? 'Expirou em:' : 'Válido até:'}</dt>
              <dd>{formatDate(integration.token_expires_at)}</dd>
            </IntegrationMetaRow>
          )}
        </IntegrationMeta>
      )}

      {/* Contagem não diz nada sozinha: o owner precisa ver QUAIS ativos são */}
      {assetGroups.length > 0 && (
        <AssetSummary>
          <AssetSummaryTitle>Ativos da empresa ({assets.length})</AssetSummaryTitle>
          {assetGroups.map((group) => (
            <AssetSummaryGroup key={group.key}>
              <AssetSummaryAccount>{group.label}</AssetSummaryAccount>
              {group.items.length > 0 && (
                <AssetSummaryItems>
                  {group.items.map((asset) => (
                    <AssetSummaryItem key={asset.external_id} title={asset.external_id}>
                      {asset.name}
                    </AssetSummaryItem>
                  ))}
                </AssetSummaryItems>
              )}
            </AssetSummaryGroup>
          ))}
        </AssetSummary>
      )}

      <IntegrationActions>
        {/* Com a conta já vinculada, liberar ativos para a empresa é a ação do
            dia a dia — refazer o OAuth vira secundário ("Reconectar"). */}
        {integration.connected ? (
          <>
            {isOwner && (
              <IntegrationPrimaryButton type="button" onClick={() => onManageAssets(integration)}>
                Gerenciar permissões
              </IntegrationPrimaryButton>
            )}
            <IntegrationButton
              type="button"
              disabled={isBusy}
              onClick={() => onConnect(integration)}
            >
              {isBusy ? 'Abrindo...' : needsScopes ? 'Completar permissões' : 'Reconectar'}
            </IntegrationButton>
            <IntegrationDangerButton
              type="button"
              disabled={isBusy}
              onClick={() => onDisconnect(integration)}
            >
              Desconectar
            </IntegrationDangerButton>
          </>
        ) : (
          <IntegrationPrimaryButton
            type="button"
            disabled={isBusy}
            onClick={() => onConnect(integration)}
          >
            {isBusy ? 'Abrindo...' : 'Conectar'}
          </IntegrationPrimaryButton>
        )}
      </IntegrationActions>
    </IntegrationCardBox>
  );
};
