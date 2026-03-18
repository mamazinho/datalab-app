import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { ILoginUserResponse } from '../../services/datalab-api/authResource';
import { SOCIAL_AUTH_CHANNEL, type ISocialLoginCallbackEvent } from '../../types/auth';
import { CallbackCard, CallbackContainer, CallbackSpinner, CallbackText, CallbackTitle } from './google-callback.style';


export const GoogleCallback: React.FC = () => {
    const [searchParams] = useSearchParams();

    useEffect(() => {
        const accessToken = searchParams.get('access_token');
        if (!accessToken) {
            console.error("Nenhum token encontrado na URL de retorno.");
            return;
        }
        const expiresIn = searchParams.get('expires_in');
        const scope = searchParams.get('scope');
        const tokenType = searchParams.get('token_type');

        const authChannel = new BroadcastChannel(SOCIAL_AUTH_CHANNEL);
        const message: ISocialLoginCallbackEvent = {
            type: 'GOOGLE_LOGIN_SUCCESS',
            response: {
                access_token: accessToken,
                expires_in: expiresIn ? parseInt(expiresIn) : 3600,
                scope: scope || 'read write',
                token_type: tokenType || 'Bearer',
            } as ILoginUserResponse,
        }
        
        authChannel.postMessage(message);
        authChannel.close();
        // Fallback & Cleanup
        setTimeout(() => {
            window.close();
            if (!window.closed) { 
                localStorage.setItem('accessToken', accessToken);
                window.location.href = '/'; 
            }
        }, 500);
            
    }, [searchParams]);

    return (
        <CallbackContainer>
            <CallbackCard>
                <CallbackSpinner />
                <CallbackTitle>Processando login...</CallbackTitle>
                <CallbackText>Por favor, aguarde um momento.</CallbackText>
            </CallbackCard>
        </CallbackContainer>
    );
};
