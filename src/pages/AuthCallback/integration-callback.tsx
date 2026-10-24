import styles from './social-callback.module.css';
import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { INTEGRATION_CALLBACK, type IIntegrationCallbackEvent } from '../../types/auth';
import { isProvider, type IntegrationKey, type Provider } from '../../types/integrations';
import { INTEGRATIONS_PATH } from '../../routes/paths';
import { closeCallbackWindow, postAuthChannelMessage } from '../../utils/auth-channel';

/**
 * Retorno do consentimento de uma integração. Mesma mecânica do login social:
 * roda no popup, publica o resultado no canal e se fecha — quem reage é a tela
 * de integrações, que continuou viva na aba original.
 *
 * O caminho "/integrations/callback" é ditado pelo backend (CLIENT_URL fixo),
 * por isso está em inglês, diferente das demais rotas do app.
 */
export const IntegrationCallback = () => {
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const status = searchParams.get('status') === 'connected' ? 'connected' : 'error';
    const provider = searchParams.get('provider');
    const integration = searchParams.get('integration');

    const message: IIntegrationCallbackEvent = {
      type: INTEGRATION_CALLBACK,
      status,
      provider: isProvider(provider) ? (provider as Provider) : null,
      integration: (integration as IntegrationKey | null) ?? null,
      error: searchParams.get('error'),
    };

    postAuthChannelMessage(message);

    // Sem popup, a própria aba volta para a tela de integrações — e no sucesso
    // já pedindo a seleção de ativos daquela integração.
    return closeCallbackWindow(() => {
      window.location.href =
        status === 'connected' && integration
          ? `${INTEGRATIONS_PATH}?ativos=${integration}`
          : INTEGRATIONS_PATH;
    });
  }, [searchParams]);

  return (
    <div className={styles.callbackContainer}>
      <div className={styles.callbackCard}>
        <div className={styles.callbackSpinner} />
        <h2 className={styles.callbackTitle}>Finalizando integração...</h2>
        <p className={styles.callbackText}>Só um instante.</p>
      </div>
    </div>
  );
};
