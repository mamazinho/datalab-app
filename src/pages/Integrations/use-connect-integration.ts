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
  onConnected: (integration: IntegrationKey) => void;
}

export const useConnectIntegration = ({ onConnected }: IUseConnectIntegrationOptions) => {
  const queryClient = useQueryClient();
  const [connectingKey, setConnectingKey] = useState<IntegrationKey | null>(null);

  const { openPopup, isPopupOpen } = useAuthPopup((event) => {
    if (event.type !== INTEGRATION_CALLBACK) return;

    setConnectingKey(null);
    // Connected or not, the connection status changed on the provider side
    void queryClient.invalidateQueries({ queryKey: integrationsQuery.queryKey });

    if (event.status !== 'connected') {
      toast.error(event.error ?? 'Não foi possível concluir a integração.');
      return;
    }

    toast.success('Integração conectada com sucesso!');
    if (event.integration) onConnected(event.integration);
  });

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

        const popup = openPopup(
          authorizationUrl,
          `${integration.provider}_integration_popup`,
          'consent',
        );

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
