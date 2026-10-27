import axios from "axios";
import { axiosCompanyInstance, axiosPrivateInstance } from "./axios";
import type { UUID7 } from "../../types/ids";
import type { AssetType, IntegrationKey, Provider } from "../../types/integrations";
import type { CompanyMembershipRole, CompanyMembershipStatus } from "./usersResource";
const AVAILABLE_ASSETS_TIMEOUT_MS = 30_000;

export interface ICreateCompanyRequest {
  name: string;
}

export interface IUpdateCompanyRequest {
  name: string;
}

// ProviderAsset mirror
export interface IProviderAsset {
  asset_type: AssetType;
  external_id: string;
  name: string;
  parent_name: string | null;
  extra: Record<string, unknown>;
}

// RetrieveCompanyProviderAsset mirror
export interface ICompanyProviderAsset extends IProviderAsset {
  id: UUID7;
  provider: Provider;
  company_id: UUID7;
  created_at: string;
  updated_at: string;
}

// RetrieveAvailableProviderAssets mirror
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

// RetrieveCompany mirror. provider_assets is the company allowlist: the only assets its members can operate.
export interface ICompany {
  id: UUID7;
  name: string;
  status: string;
  created_by_user_id: UUID7;
  created_at: string;
  updated_at: string;
  provider_assets?: ICompanyProviderAsset[];
}

// RetrieveCompanyMembership mirror
export interface ICreateCompanyMembership {
  id: UUID7;
  user_id: UUID7;
  company_id: UUID7;
  membership_role: CompanyMembershipRole;
  status: CompanyMembershipStatus;
  created_at: string;
  updated_at: string;
}

// RetrieveCompanyWithMembership mirror
export interface ICreateCompanyResponse {
  company: ICompany;
  membership: ICreateCompanyMembership;
}

export const CompaniesResource = {
  async createCompany(payload: ICreateCompanyRequest): Promise<ICreateCompanyResponse> {
    const response = await axiosPrivateInstance.post('companies/', payload);
    return response.data as ICreateCompanyResponse;
  },

  async updateCompany(companyId: UUID7, payload: IUpdateCompanyRequest): Promise<ICompany> {
    const response = await axiosCompanyInstance.patch(`companies/${companyId}/`, payload);
    return response.data as ICompany;
  },

  async deleteCompany(companyId: UUID7): Promise<void> {
    await axiosCompanyInstance.delete(`companies/${companyId}/`);
  },

  async listAvailableProviderAssets(
    companyId: UUID7,
    integration: IntegrationKey,
  ): Promise<IAvailableProviderAssets> {
    const response = await axiosCompanyInstance.get(
      `companies/${companyId}/provider-assets/available/`,
      { params: { integration }, timeout: AVAILABLE_ASSETS_TIMEOUT_MS },
    );
    return response.data as IAvailableProviderAssets;
  },

  async listProviderAssets(
    companyId: UUID7,
    provider?: Provider,
  ): Promise<ICompanyProviderAsset[]> {
    const response = await axiosCompanyInstance.get(`companies/${companyId}/provider-assets/`, {
      params: provider ? { provider } : undefined,
    });
    return response.data as ICompanyProviderAsset[];
  },

  // Idempotent: sending an external_id again updates its name
  async addProviderAsset(
    companyId: UUID7,
    payload: IAddProviderAssetRequest,
  ): Promise<ICompanyProviderAsset> {
    const response = await axiosCompanyInstance.post(
      `companies/${companyId}/provider-assets/`,
      payload,
    );
    return response.data as ICompanyProviderAsset;
  },

  // 404 means the asset is already gone, which is the desired end state
  async removeProviderAsset(companyId: UUID7, assetId: UUID7): Promise<void> {
    try {
      await axiosCompanyInstance.delete(`companies/${companyId}/provider-assets/${assetId}/`);
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.status === 404) return;
      throw error;
    }
  },
};
