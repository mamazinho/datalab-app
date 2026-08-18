import type { ILoginUserResponse } from "../services/datalab-api/authResource";
import type { IntegrationKey, Provider } from "./integrations";

// Canal único entre a janela de callback e a aba que abriu o popup: tanto o
// login social quanto a conexão de uma integração voltam por aqui.
export const SOCIAL_AUTH_CHANNEL = 'auth_channel';

export const SOCIAL_LOGIN_SUCCESS = 'SOCIAL_LOGIN_SUCCESS';
export const INTEGRATION_CALLBACK = 'INTEGRATION_CALLBACK';

export interface ISocialLoginCallbackEvent {
  type: typeof SOCIAL_LOGIN_SUCCESS;
  provider: Provider;
  response: ILoginUserResponse;
}

export interface IIntegrationCallbackEvent {
  type: typeof INTEGRATION_CALLBACK;
  status: 'connected' | 'error';
  provider: Provider | null;
  integration: IntegrationKey | null;
  error: string | null;
}

export type AuthChannelEvent = ISocialLoginCallbackEvent | IIntegrationCallbackEvent;
