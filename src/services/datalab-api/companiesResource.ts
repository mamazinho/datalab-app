import axios from "axios";
import { axiosCompanyInstance, axiosPrivateInstance } from "./axios";
import type { UUID } from "../../types/ids";
import type { AssetType, IntegrationKey, Provider } from "../../types/integrations";
import type { CompanyMembershipRole, CompanyMembershipStatus, IUserCompany } from "./usersResource";

export interface ICreateCompanyRequest {
  name: string;
}

export interface IUpdateCompanyRequest {
  name: string;
}

// Ativo de provider (property do GA4, ad account/página/instagram do Meta...)
// como o provider o descreve — é o que vem de provider-assets/available/.
export interface IProviderAsset {
  asset_type: AssetType;
  external_id: string;
  name: string;
  parent_name: string | null;
  extra: Record<string, unknown>;
}

// Ativo já salvo na allowlist da empresa (tem id, usado no DELETE)
export interface ICompanyProviderAsset extends IProviderAsset {
  id: UUID;
  provider: Provider;
  company_id: UUID;
  created_at: string;
  updated_at: string;
}

// Insumo da tela de seleção: tudo que a conta conectada do owner enxerga +
// o que já está liberado para a empresa (marca os checkboxes iniciais).
export interface IAvailableProviderAssets {
  provider: Provider;
  integration: IntegrationKey;
  assets: IProviderAsset[];
  allowed_external_ids: string[];
}

export interface IAddProviderAssetRequest {
  provider: Provider;
  asset: IProviderAsset;
}

// Empresa plain — espelho de RetrieveCompany no backend (sem membership).
// provider_assets é a allowlist da empresa: onde qualquer membro pode operar.
export interface ICompany {
  id: UUID;
  name: string;
  status: string;
  created_by_user_id: UUID;
  created_at: string;
  updated_at: string;
  provider_assets?: ICompanyProviderAsset[];
}

// Membership retornado na criação da empresa — espelho de RetrieveCompanyMembership
export interface ICreateCompanyMembership {
  id: UUID;
  user_id: UUID;
  company_id: UUID;
  membership_role: CompanyMembershipRole;
  status: CompanyMembershipStatus;
  created_at: string;
  updated_at: string;
}

// Resposta do POST /companies/ — espelho de RetrieveCompanyWithMembership
export interface ICreateCompanyResponse {
  company: ICompany;
  membership: ICreateCompanyMembership;
}

export const CompaniesResource = {
  async listUserCompanies(): Promise<IUserCompany[]> {
    const response = await axiosPrivateInstance.get('companies/');
    return response.data as IUserCompany[];
  },

  async createCompany(payload: ICreateCompanyRequest): Promise<ICreateCompanyResponse> {
    const response = await axiosPrivateInstance.post('companies/', payload);
    return response.data as ICreateCompanyResponse;
  },

  // update/delete usam axiosCompanyInstance: o X-Company-Id do interceptor
  // (empresa ativa) é o alvo da ação e o que o backend usa para autorizar.
  async updateCompany(companyId: UUID, payload: IUpdateCompanyRequest): Promise<ICompany> {
    const response = await axiosCompanyInstance.patch(`companies/${companyId}/`, payload);
    return response.data as ICompany;
  },

  async deleteCompany(companyId: UUID): Promise<void> {
    await axiosCompanyInstance.delete(`companies/${companyId}/`);
  },

  // ── Allowlist de ativos ──────────────────────────────────────────────────────
  // Todas exigem X-Company-Id igual ao {id} do path (o interceptor manda a
  // empresa ativa, que é sempre o alvo destas telas). available/, listagem e
  // remoção são só do owner; a inclusão é gated por route permission.

  async listAvailableProviderAssets(
    companyId: UUID,
    integration: IntegrationKey,
  ): Promise<IAvailableProviderAssets> {
    const response = await axiosCompanyInstance.get(
      `companies/${companyId}/provider-assets/available/`,
      { params: { integration } },
    );
    return response.data as IAvailableProviderAssets;
  },

  async listProviderAssets(
    companyId: UUID,
    provider?: Provider,
  ): Promise<ICompanyProviderAsset[]> {
    const response = await axiosCompanyInstance.get(`companies/${companyId}/provider-assets/`, {
      params: provider ? { provider } : undefined,
    });
    return response.data as ICompanyProviderAsset[];
  },

  // Idempotente: repetir o mesmo external_id atualiza o nome em vez de duplicar.
  async addProviderAsset(
    companyId: UUID,
    payload: IAddProviderAssetRequest,
  ): Promise<ICompanyProviderAsset> {
    const response = await axiosCompanyInstance.post(
      `companies/${companyId}/provider-assets/`,
      payload,
    );
    return response.data as ICompanyProviderAsset;
  },

  // 404 = o ativo já não está na allowlist, que é o estado final desejado.
  async removeProviderAsset(companyId: UUID, assetId: UUID): Promise<void> {
    try {
      await axiosCompanyInstance.delete(`companies/${companyId}/provider-assets/${assetId}/`);
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.status === 404) return;
      throw error;
    }
  },
};
