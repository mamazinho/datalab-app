import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthPopup } from '../../hooks/use-auth-popup';
import { integrationsQuery } from '../../queries';
import { DatalabAPI } from '../../services/datalab-api';
import type { IIntegrationStatus } from '../../services/datalab-api/authResource';
import { INTEGRATION_CALLBACK } from '../../types/auth';
import type { IntegrationKey } from '../../types/integrations';

interface IUseConnectIntegrationOptions {
  /** Chamado no sucesso — a tela emenda a seleção de ativos daquela integração */
  onConnected: (integration: IntegrationKey) => void;
}

/**
 * Conectar uma integração é o mesmo fluxo do login social: o consentimento
 * acontece numa janela separada e o resultado volta pelo canal, sem a tela de
 * integrações perder o estado (nem a empresa ativa) por uma navegação.
 */
export const useConnectIntegration = ({ onConnected }: IUseConnectIntegrationOptions) => {
  const queryClient = useQueryClient();
  const [connectingKey, setConnectingKey] = useState<IntegrationKey | null>(null);

  const { openPopup, isPopupOpen } = useAuthPopup((event) => {
    if (event.type !== INTEGRATION_CALLBACK) return;

    setConnectingKey(null);
    // Conectado ou não, o status da conexão mudou do lado do provider.
    void queryClient.invalidateQueries({ queryKey: integrationsQuery.queryKey });

    if (event.status !== 'connected') {
      toast.error(event.error ?? 'Não foi possível concluir a integração.');
      return;
    }

    toast.success('Integração conectada com sucesso!');
    if (event.integration) onConnected(event.integration);
  });

  // Desistir fechando a janela também destrava o botão.
  useEffect(() => {
    if (!isPopupOpen) setConnectingKey(null);
  }, [isPopupOpen]);

  const connect = useCallback(
    async (integration: IIntegrationStatus) => {
      setConnectingKey(integration.key);
      try {
        const authorizationUrl = await DatalabAPI.AuthResource.getIntegrationAuthorizationUrl(
          integration.provider,
          integration.key,
        );

        const popup = openPopup(authorizationUrl, `${integration.provider}_integration_popup`);

        if (!popup) {
          toast.error('Permita janelas pop-up neste site para conectar sua conta.');
          setConnectingKey(null);
        }
      } catch (e: unknown) {
        toast.error(e instanceof Error ? e.message : 'Não foi possível iniciar a integração.');
        setConnectingKey(null);
      }
    },
    [openPopup],
  );

  return { connect, connectingKey };
};
