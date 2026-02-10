import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { ILoginUserResponse } from '../../services/datalab-api/authResource';

export const GoogleCallback: React.FC = () => {
    const [searchParams] = useSearchParams();

    useEffect(() => {
        const accessToken = searchParams.get('access_token');
        const expiresIn = searchParams.get('expires_in');
        const scope = searchParams.get('scope');
        const tokenType = searchParams.get('token_type');

        if (accessToken) {
            // Usa BroadcastChannel para comunicação robusta e isolada
            const authChannel = new BroadcastChannel('auth_channel');
            
            authChannel.postMessage({
                type: 'GOOGLE_LOGIN_SUCCESS',
                response: {
                    access_token: accessToken,
                    expires_in: expiresIn ? parseInt(expiresIn) : 3600,
                    scope: scope || 'read write',
                    token_type: tokenType || 'Bearer',
                } as ILoginUserResponse,
            });

            authChannel.close();

            // Fallback & Cleanup
            setTimeout(() => {
                window.close();
                if (!window.closed) { 
                    localStorage.setItem('accessToken', accessToken);
                    window.location.href = '/'; 
                }
            }, 500);
            
        } else {
            // Tratar erro ou apenas fechar após alguns segundos
            console.error("Nenhum token encontrado na URL de retorno.");
            // Opcional: window.close(); após timeout
        }
    }, [searchParams]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
            <div className="p-8 text-center bg-white rounded-xl shadow-lg">
                <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin mx-auto mb-4"></div>
                <h2 className="text-gray-800 font-semibold text-lg">Processando login...</h2>
                <p className="text-gray-500 text-sm mt-2">Por favor, aguarde um momento.</p>
            </div>
        </div>
    );
};
