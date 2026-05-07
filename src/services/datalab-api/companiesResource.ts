import { axiosCompanyInstance, axiosPrivateInstance } from "./axios";
import type { CompanyMembershipRole, CompanyMembershipStatus, IUserCompany } from "./usersResource";

export interface ICreateCompanyRequest {
  name: string;
}

// Empresa plain — espelho de RetrieveCompany no backend (sem membership)
export interface ICompany {
  id: number;
  name: string;
  status: string;
  created_by_user_id: number;
  created_at: string;
  updated_at: string;
}

// Membership retornado na criação da empresa — espelho de RetrieveCompanyMembership
export interface ICreateCompanyMembership {
  id: number;
  user_id: number;
  company_id: number;
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

  async getCurrentCompany(): Promise<ICompany> {
    const response = await axiosCompanyInstance.get('companies/current/');
    return response.data as ICompany;
  },
};
