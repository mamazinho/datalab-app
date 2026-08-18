import { Suspense, useActionState, useCallback, useMemo, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { ErrorBoundary, type FallbackProps } from 'react-error-boundary';
import { QueryErrorResetBoundary, useQueryClient, useSuspenseQueries } from '@tanstack/react-query';
import { Modal } from '../../../components/UI/Modal/modal';
import { LoadingPiece } from '../../../components/Feedback/Loadings/loading';
import {
  availableProviderAssetsQuery,
  companyProviderAssetsQuery,
  currentMembershipQuery,
} from '../../../queries';
import { INITIAL_ACTION_STATE } from '../../../types/actions';
import { useActionFeedback } from '../../../hooks/use-action-feedback';
import type { IIntegrationStatus } from '../../../services/datalab-api/authResource';
import type { UUID } from '../../../types/ids';
import { PROVIDER_LABELS } from '../../../utils/integrations';
import {
  createSaveProviderAssetsAction,
  diffProviderAssets,
  type ISaveProviderAssetsResult,
} from '../actions';
import { AssetsSelector } from './assets-selector';
import {
  AssetsError,
  AssetsFallback,
  AssetsFieldset,
  AssetsFooter,
  AssetsForm,
  AssetsIntro,
  AssetsSubmit,
  AssetsSummary,
  IntegrationButton,
  IntegrationsEmpty,
} from '../integrations.style';

interface IProviderAssetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  companyId: UUID;
  integration: IIntegrationStatus | null;
}

// Cada status tem um significado próprio nesta tela — em especial o 502, que
// NÃO pode ser lido como "não há ativos" (a core-api só está fora do ar).
const assetsErrorMessage = (error: unknown): string => {
  if (!axios.isAxiosError(error)) return 'Não foi possível carregar os ativos.';

  switch (error.response?.status) {
    case 403:
      return 'Apenas o owner da empresa pode gerenciar os ativos.';
    case 400:
      return 'A conexão com o provedor não está válida. Feche esta janela e reconecte sua conta para escolher os ativos.';
    case 502:
      return 'O serviço do provedor não respondeu agora. Isso costuma ser temporário — tente novamente.';
    default:
      return error.message || 'Não foi possível carregar os ativos.';
  }
};

const AssetsErrorFallback = ({ error, resetErrorBoundary }: FallbackProps) => (
  <AssetsFallback>
    <span>{assetsErrorMessage(error)}</span>
    <IntegrationButton type="button" onClick={resetErrorBoundary}>
      Tentar novamente
    </IntegrationButton>
  </AssetsFallback>
);

interface IProviderAssetsContentProps {
  companyId: UUID;
  integration: IIntegrationStatus;
  onClose: () => void;
}

const ProviderAssetsContent = ({ companyId, integration, onClose }: IProviderAssetsContentProps) => {
  const queryClient = useQueryClient();

  const [{ data: available }, { data: saved }] = useSuspenseQueries({
    queries: [
      availableProviderAssetsQuery(companyId, integration.key),
      companyProviderAssetsQuery(companyId),
    ],
  });

  // Numa empresa nova nada vem marcado: esquecer de marcar deixa sem acesso
  // (chato), esquecer de desmarcar daria acesso indevido (grave).
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(available.allowed_external_ids),
  );

  const saveAction = useMemo(
    () =>
      createSaveProviderAssetsAction({
        companyId,
        provider: available.provider,
        integration: integration.key,
        available: available.assets,
        saved,
        allowedExternalIds: available.allowed_external_ids,
      }),
    [companyId, integration.key, available, saved],
  );

  const [saveState, saveFormAction, isPending] = useActionState(saveAction, INITIAL_ACTION_STATE);

  useActionFeedback<ISaveProviderAssetsResult>(saveState, {
    onSuccess: (result) => {
      toast.success(
        result && (result.added || result.removed)
          ? `Ativos atualizados: ${result.added} liberado(s), ${result.removed} removido(s).`
          : 'Nenhuma alteração a salvar.',
      );
      void queryClient.invalidateQueries({
        queryKey: availableProviderAssetsQuery(companyId, integration.key).queryKey,
      });
      void queryClient.invalidateQueries({
        queryKey: companyProviderAssetsQuery(companyId).queryKey,
      });
      // company.provider_assets (contagem dos cards) mora no membership atual
      void queryClient.invalidateQueries({
        queryKey: currentMembershipQuery(companyId).queryKey,
      });
      onClose();
    },
    // Erro aparece inline no formulário — sem toast duplicado
    onError: () => {},
  });

  const removedCount = useMemo(
    () =>
      diffProviderAssets({
        integration: integration.key,
        available: available.assets,
        saved,
        allowedExternalIds: available.allowed_external_ids,
        selected,
      }).toRemove.length,
    [available, saved, selected, integration.key],
  );

  // Tirar um ativo faz o agente perder acesso NA HORA — o diálogo precisa dizer
  // isso. Cancelar impede o submit (e, com ele, a action do formulário).
  const handleSubmitClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      if (removedCount === 0) return;

      const confirmed = window.confirm(
        `Você está removendo ${removedCount} ativo(s) de ${integration.label}. ` +
          'O agente perde o acesso a eles imediatamente e ninguém desta empresa ' +
          'conseguirá operá-los até que sejam liberados de novo. Continuar?',
      );

      if (!confirmed) event.preventDefault();
    },
    [removedCount, integration.label],
  );

  if (available.assets.length === 0) {
    return (
      <IntegrationsEmpty>
        A conta {PROVIDER_LABELS[available.provider]} conectada não enxerga nenhum ativo de{' '}
        {integration.label}. Verifique se ela tem acesso na plataforma do provedor e tente de novo.
      </IntegrationsEmpty>
    );
  }

  return (
    <AssetsForm action={saveFormAction}>
      {Array.from(selected).map((externalId) => (
        <input key={externalId} type="hidden" name="assets" value={externalId} />
      ))}

      <AssetsFieldset disabled={isPending}>
        <AssetsIntro>
          Marque o que pertence a esta empresa. O agente só enxerga e só opera o que estiver
          nesta lista — deixar tudo desmarcado significa acesso zero, não acesso total.
        </AssetsIntro>

        <AssetsSelector
          assets={available.assets}
          provider={available.provider}
          selected={selected}
          onChange={setSelected}
        />

        {!saveState.success && saveState.error && <AssetsError>{saveState.error}</AssetsError>}

        <AssetsFooter>
          <AssetsSummary>
            {selected.size === 0
              ? `Esta empresa ainda não pode operar o ${integration.label}`
              : `${selected.size} ativo(s) selecionado(s)`}
          </AssetsSummary>
          <AssetsSubmit type="submit" disabled={isPending} onClick={handleSubmitClick}>
            {isPending ? 'Salvando...' : 'Salvar seleção'}
          </AssetsSubmit>
        </AssetsFooter>
      </AssetsFieldset>
    </AssetsForm>
  );
};

export const ProviderAssetsModal = ({
  isOpen,
  onClose,
  companyId,
  integration,
}: IProviderAssetsModalProps) => (
  <Modal
    isOpen={isOpen}
    onClose={onClose}
    title={integration ? `Ativos — ${integration.label}` : 'Ativos'}
  >
    {integration && (
      <QueryErrorResetBoundary>
        {({ reset }) => (
          <ErrorBoundary FallbackComponent={AssetsErrorFallback} onReset={reset}>
            <Suspense fallback={<LoadingPiece />}>
              <ProviderAssetsContent
                companyId={companyId}
                integration={integration}
                onClose={onClose}
              />
            </Suspense>
          </ErrorBoundary>
        )}
      </QueryErrorResetBoundary>
    )}
  </Modal>
);
