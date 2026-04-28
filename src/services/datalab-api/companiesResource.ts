import { axiosCompanyInstance, axiosPrivateInstance } from "./axios";
import type { IUserCompany } from "./usersResource";

export interface ICreateCompanyRequest {
  name: string;
}

export const CompaniesResource = {
  async listUserCompanies(): Promise<IUserCompany[]> {
    const response = await axiosPrivateInstance.get('companies/');
    return response.data as IUserCompany[];
  },

  async createCompany(payload: ICreateCompanyRequest): Promise<IUserCompany> {
    const response = await axiosPrivateInstance.post('companies/', payload);
    return response.data as IUserCompany;
  },

  async getCurrentCompany(): Promise<IUserCompany> {
    const response = await axiosCompanyInstance.get('companies/current/');
    return response.data as IUserCompany;
  },
};
