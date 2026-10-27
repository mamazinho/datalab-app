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

// IntegrationStatus mirror. missing_scopes on a connected integration means the consent must be completed, not redone.
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

  async logout(): Promise<void> {
    await axiosInstance.post('auth/logout/');
  },

  async refresh(): Promise<ILoginUserResponse> {
    const response = await axiosInstance.post('auth/refresh/');
    return response.data as ILoginUserResponse;
  },

  // A browser navigation, not an XHR: the provider has to render its consent screen
  socialLoginUrl(provider: Provider): string {
    return `${import.meta.env.VITE_DATALAB_API_URL}/auth/${provider}/login/`;
  },

  async listIntegrations(): Promise<IIntegrationStatus[]> {
    const response = await axiosPrivateInstance.get('auth/integrations/');
    return response.data as IIntegrationStatus[];
  },

  async getIntegrationAuthorizationUrl(
    provider: Provider,
    integration: IntegrationKey,
  ): Promise<string> {
    const response = await axiosPrivateInstance.get(`auth/${provider}/authorize/`, {
      params: { integration },
    });
    return (response.data as IAuthorizationUrlResponse).authorization_url;
  },

  // Drops every integration of the provider. 404 means it was already disconnected.
  async disconnectProvider(provider: Provider): Promise<void> {
    try {
      await axiosPrivateInstance.delete(`auth/${provider}/connection/`);
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.status === 404) return;
      throw error;
    }
  },
}
