import axios from "axios";
import { axiosInstance, axiosPrivateInstance } from "./axios";
import type { IntegrationKey, Provider } from "../../types/integrations";

export interface ILoginUserRequest {
  email: string;
  password: string;
}

export interface ILoginUserResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
}

// Catálogo de integrações COM o status do usuário logado (GET auth/integrations/).
// connected = todos os escopos concedidos; missing_scopes preenchido com conta já
// vinculada significa ativação incremental ("Gerenciar permissões").
export interface IIntegrationStatus {
  key: IntegrationKey;
  provider: Provider;
  label: string;
  description: string;
  is_login: boolean;
  scopes: string[];
  connected: boolean;
  missing_scopes: string[];
  token_expires_at: string | null;
  connected_account_email: string | null;
}

export interface IAuthorizationUrlResponse {
  authorization_url: string;
}

export const AuthResource = {
  async login(userData: ILoginUserRequest): Promise<ILoginUserResponse> {
    const response = await axiosInstance.post(
      `auth/login/`,
      userData
    )
    return response.data as ILoginUserResponse;
  },

  // ── Login social ─────────────────────────────────────────────────────────────
  // Navegação do browser (popup), não XHR: o provider precisa renderizar a tela
  // de consentimento e devolver o token na query string do nosso callback.
  socialLoginUrl(provider: Provider): string {
    return `${import.meta.env.VITE_DATALAB_API_URL}/auth/${provider}/login/`;
  },

  // ── Integrações ──────────────────────────────────────────────────────────────

  async listIntegrations(): Promise<IIntegrationStatus[]> {
    const response = await axiosPrivateInstance.get('auth/integrations/');
    return response.data as IIntegrationStatus[];
  },

  // Gera a URL de consentimento da integração; quem navega até ela é o front.
  async getIntegrationAuthorizationUrl(
    provider: Provider,
    integration: IntegrationKey,
  ): Promise<string> {
    const response = await axiosPrivateInstance.get(`auth/${provider}/authorize/`, {
      params: { integration },
    });
    return (response.data as IAuthorizationUrlResponse).authorization_url;
  },

  // Remove a conexão do provider INTEIRO (todas as integrações dele).
  // 404 = já não havia conexão, que é o estado final desejado.
  async disconnectProvider(provider: Provider): Promise<void> {
    try {
      await axiosPrivateInstance.delete(`auth/${provider}/connection/`);
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.status === 404) return;
      throw error;
    }
  },
}
