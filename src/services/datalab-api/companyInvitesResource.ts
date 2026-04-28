import { axiosCompanyInstance } from "./axios";
import type { IUserInvite, CompanyMembershipRole } from "./usersResource";

export interface ICreateCompanyInviteRequest {
  email: string;
  membership_role?: CompanyMembershipRole;
}

export const CompanyInvitesResource = {
  async listInvites(): Promise<IUserInvite[]> {
    const response = await axiosCompanyInstance.get('companies/current/invites/');
    return response.data as IUserInvite[];
  },

  async createInvite(payload: ICreateCompanyInviteRequest): Promise<IUserInvite> {
    const response = await axiosCompanyInstance.post('companies/current/invites/', payload);
    return response.data as IUserInvite;
  },

  async deleteInvite(inviteId: number): Promise<void> {
    await axiosCompanyInstance.delete(`companies/current/invites/${inviteId}/`);
  },
};
