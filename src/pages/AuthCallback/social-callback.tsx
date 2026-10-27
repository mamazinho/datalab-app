import styles from './social-callback.module.css';
import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { DatalabAPI } from '../../services/datalab-api';
import { SOCIAL_LOGIN_SUCCESS } from '../../types/auth';
import { isProvider } from '../../types/integrations';
import { closeCallbackWindow, postAuthChannelMessage } from '../../utils/auth-channel';

/**
 * Retorno do login social. A API devolve só o cookie de sessão (token na URL ficaria
 * no histórico); o access token sai do refresh. Roda dentro do popup: publica o login
 * para a aba original e se fecha. Sem popup (aba única), cai no fallback de redirect.
 */
export const SocialCallback: React.FC = () => {
    const { provider } = useParams<{ provider: string }>();
    const [searchParams] = useSearchParams();
    const [error, setError] = useState<string | null>(searchParams.get('error'));

    useEffect(() => {
        if (searchParams.get('error')) return;

        let stopClosing: (() => void) | undefined;
        let cancelled = false;

        DatalabAPI.AuthResource.refresh()
            .then((response) => {
                if (cancelled) return;
                postAuthChannelMessage({
                    type: SOCIAL_LOGIN_SUCCESS,
                    provider: isProvider(provider) ? provider : 'google',
                    response,
                });
                stopClosing = closeCallbackWindow(() => {
                    localStorage.setItem('accessToken', response.access_token);
                    window.location.href = '/';
                });
            })
            .catch(() => {
                if (!cancelled) setError('Não foi possível concluir o login com o provedor.');
            });

        return () => {
            cancelled = true;
            stopClosing?.();
        };
    }, [searchParams, provider]);

    return (
        <div className={styles.callbackContainer}>
            <div className={styles.callbackCard}>
                {!error && <div className={styles.callbackSpinner} />}
                <h2 className={styles.callbackTitle}>{error ? 'Não foi possível entrar' : 'Processando login...'}</h2>
                <p className={styles.callbackText}>{error ?? 'Por favor, aguarde um momento.'}</p>
            </div>
        </div>
    );
};
