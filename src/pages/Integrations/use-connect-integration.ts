import { useState, useTransition } from 'react';
import { toast } from 'react-toastify';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthPopup } from '../../hooks/use-auth-popup';
import { integrationsQuery } from '../../queries';
import { DatalabAPI } from '../../services/datalab-api';
import type { IIntegrationStatus } from '../../services/datalab-api/authResource';
import { INTEGRATION_CALLBACK } from '../../types/auth';
import type { IntegrationKey } from '../../types/integrations';
import { toastError, toastRequestError } from '../../components/Feedback/ErrorToast';

interface IUseConnectIntegrationOptions {
  onConnected: (integration: IntegrationKey) => void;
}

export const useConnectIntegration = ({ onConnected }: IUseConnectIntegrationOptions) => {
  const queryClient = useQueryClient();
  const [requestedKey, setRequestedKey] = useState<IntegrationKey | null>(null);
  const [isFetchingUrl, startFetchingUrl] = useTransition();

  const { openPopup, isPopupOpen } = useAuthPopup((event) => {
    if (event.type !== INTEGRATION_CALLBACK) return;

    // Connected or not, the connection status changed on the provider side
    void queryClient.invalidateQueries({ queryKey: integrationsQuery.queryKey });

    if (event.status !== 'connected') {
      toastError(event.friendlyMessage ?? 'Não foi possível concluir a integração.');
      return;
    }

    toast.success('Integração conectada com sucesso!');
    if (event.integration) onConnected(event.integration);
  });

  // Busy from asking for the consent URL until the popup closes
  const connectingKey = isFetchingUrl || isPopupOpen ? requestedKey : null;

  const connect = (integration: IIntegrationStatus) => {
    setRequestedKey(integration.key);
    startFetchingUrl(async () => {
      try {
        const authorizationUrl = await DatalabAPI.AuthResource.getIntegrationAuthorizationUrl(
          integration.provider,
          integration.key,
        );
        if (!openPopup(authorizationUrl, `${integration.provider}_integration_popup`, 'consent')) {
          toastError('Permita janelas pop-up neste site para conectar sua conta.');
        }
      } catch (e: unknown) {
        toastRequestError(e);
      }
    });
  };

  return { connect, connectingKey };
};
