import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import type { ILoginUserResponse } from '../../services/datalab-api/authResource';
import { SOCIAL_LOGIN_SUCCESS, type ISocialLoginCallbackEvent } from '../../types/auth';
import { isProvider, type Provider } from '../../types/integrations';
import { closeCallbackWindow, postAuthChannelMessage } from '../../utils/auth-channel';
import { CallbackCard, CallbackContainer, CallbackSpinner, CallbackText, CallbackTitle } from './social-callback.style';

/**
 * Retorno do login social (Google e Meta usam o mesmo formato de query string).
 * Roda dentro do popup: publica o token no canal para a aba original concluir o
 * login e se fecha. Sem popup (aba única), cai no fallback de redirect.
 */
export const SocialCallback: React.FC = () => {
    const { provider } = useParams<{ provider: string }>();
    const [searchParams] = useSearchParams();
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const errorParam = searchParams.get('error');
        const accessToken = searchParams.get('access_token');

        if (errorParam || !accessToken) {
            setError(errorParam ?? 'Não recebemos o token de acesso do provedor.');
            return;
        }

        const expiresIn = searchParams.get('expires_in');
        const scope = searchParams.get('scope');
        const tokenType = searchParams.get('token_type');

        const message: ISocialLoginCallbackEvent = {
            type: SOCIAL_LOGIN_SUCCESS,
            provider: (isProvider(provider) ? provider : 'google') as Provider,
            response: {
                access_token: accessToken,
                expires_in: expiresIn ? parseInt(expiresIn) : 3600,
                scope: scope || 'read write',
                token_type: tokenType || 'Bearer',
            } as ILoginUserResponse,
        };

        postAuthChannelMessage(message);

        return closeCallbackWindow(() => {
            localStorage.setItem('accessToken', accessToken);
            window.location.href = '/';
        });
    }, [searchParams, provider]);

    return (
        <CallbackContainer>
            <CallbackCard>
                {!error && <CallbackSpinner />}
                <CallbackTitle>{error ? 'Não foi possível entrar' : 'Processando login...'}</CallbackTitle>
                <CallbackText>{error ?? 'Por favor, aguarde um momento.'}</CallbackText>
            </CallbackCard>
        </CallbackContainer>
    );
};
