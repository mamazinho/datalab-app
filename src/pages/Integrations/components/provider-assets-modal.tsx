import styles from '../integrations.module.css';
import { Suspense, useActionState, useState } from 'react';
import { toast } from 'react-toastify';
import { ErrorBoundary, type FallbackProps } from 'react-error-boundary';
import { QueryErrorResetBoundary, useQueryClient, useSuspenseQueries } from '@tanstack/react-query';
import { Modal } from '../../../components/UI/Modal/modal';
import { LoadingPiece } from '../../../components/Feedback/Loadings/loading';
import { ApiError } from '../../../utils/api-error';
import { useConfirm } from '../../../contexts/confirm';
import {
  availableProviderAssetsQuery,
  companyProviderAssetsQuery,
  currentMembershipQuery,
} from '../../../queries';
import { INITIAL_ACTION_STATE } from '../../../types/actions';
import { useActionFeedback } from '../../../hooks/use-action-feedback';
import type { IIntegrationStatus } from '../../../services/datalab-api/authResource';
import type { UUID7 } from '../../../types/ids';
import { PROVIDER_LABELS } from '../../../utils/integrations';
import {
  createSaveProviderAssetsAction,
  diffProviderAssets,
  type ISaveProviderAssetsResult,
} from '../actions';
import { AssetsSelector } from './assets-selector';
import { FormFieldset, SubmitButton } from '../../../components/UI/Forms';

interface IProviderAssetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  companyId: UUID7;
  integration: IIntegrationStatus | null;
}

const AssetsErrorFallback = ({ error, resetErrorBoundary }: FallbackProps) => (
  <div className={styles.assetsFallback}>
    <span>{ApiError.from(error).friendly_message}</span>
    <button className={styles.integrationButton} type="button" onClick={resetErrorBoundary}>
      Tentar novamente
    </button>
  </div>
);

interface IProviderAssetsContentProps {
  companyId: UUID7;
  integration: IIntegrationStatus;
  onClose: () => void;
}

const ProviderAssetsContent = ({ companyId, integration, onClose }: IProviderAssetsContentProps) => {
  const queryClient = useQueryClient();
  const confirm = useConfirm();

  const [{ data: available }, { data: saved }] = useSuspenseQueries({
    queries: [
      availableProviderAssetsQuery(companyId, integration.key),
      companyProviderAssetsQuery(companyId),
    ],
  });

  // Nothing starts checked: forgetting to check is an annoyance, forgetting to uncheck would leak access
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(available.allowed_external_ids),
  );

  const saveAction = createSaveProviderAssetsAction({
        companyId,
        provider: available.provider,
        integration: integration.key,
        available: available.assets,
        saved,
        allowedExternalIds: available.allowed_external_ids,
      });

  const [saveState, saveFormAction] = useActionState(saveAction, INITIAL_ACTION_STATE);

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
      // company.provider_assets, used by the cards, comes with the current membership
      void queryClient.invalidateQueries({
        queryKey: currentMembershipQuery(companyId).queryKey,
      });
      onClose();
    },
    // The error shows inline in the form
    onError: () => {},
  });

  const removedCount = diffProviderAssets({
        integration: integration.key,
        available: available.assets,
        saved,
        allowedExternalIds: available.allowed_external_ids,
        selected,
      }).toRemove.length;

  // The submit waits for the dialog, so it is held here and sent again once confirmed
  const handleSubmitClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
    if (removedCount === 0) return;

    event.preventDefault();
    const form = event.currentTarget.form;
    const confirmed = await confirm({
      title: 'Remover ativos',
      message:
        `Você está removendo ${removedCount} ativo(s) de ${integration.label}. ` +
        'O agente perde o acesso a eles imediatamente e ninguém desta empresa ' +
        'conseguirá operá-los até que sejam liberados de novo.',
      confirmLabel: 'Remover',
    });

    if (confirmed) form?.requestSubmit();
  };

  if (available.assets.length === 0) {
    return (
      <p className={styles.integrationsEmpty}>
        A conta {PROVIDER_LABELS[available.provider]} conectada não enxerga nenhum ativo de{' '}
        {integration.label}. Verifique se ela tem acesso na plataforma do provedor e tente de novo.
      </p>
    );
  }

  return (
    <form className={styles.assetsForm} action={saveFormAction}>
      {Array.from(selected).map((externalId) => (
        <input key={externalId} type="hidden" name="assets" value={externalId} />
      ))}

      <FormFieldset className={styles.assetsFieldset}>
        <p className={styles.assetsIntro}>
          Marque o que pertence a esta empresa. O agente só enxerga e só opera o que estiver
          nesta lista — deixar tudo desmarcado significa acesso zero, não acesso total.
        </p>

        <AssetsSelector
          assets={available.assets}
          provider={available.provider}
          selected={selected}
          onChange={setSelected}
        />

        {!saveState.success && saveState.error && <p className={styles.assetsError}>{saveState.error}</p>}

        <footer className={styles.assetsFooter}>
          <span className={styles.assetsSummary}>
            {selected.size === 0
              ? `Esta empresa ainda não pode operar o ${integration.label}`
              : `${selected.size} ativo(s) selecionado(s)`}
          </span>
          <SubmitButton className={styles.assetsSubmit} onClick={handleSubmitClick} pendingLabel="Salvando...">
            Salvar seleção
          </SubmitButton>
        </footer>
      </FormFieldset>
    </form>
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
