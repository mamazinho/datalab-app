import { axiosCompanyInstance } from "./axios";
import type { ICompanyMembership, CompanyMembershipRole } from "./usersResource";

export interface ICreateMembershipRequest {
  user_id: number;
  membership_role?: CompanyMembershipRole;
}

export interface IUpdateMembershipRequest {
  membership_role?: CompanyMembershipRole;
  status?: string;
}

export const CompanyMembersResource = {
  async listMembers(): Promise<ICompanyMembership[]> {
    const response = await axiosCompanyInstance.get('companies/current/members/');
    return response.data as ICompanyMembership[];
  },

  async addMember(payload: ICreateMembershipRequest): Promise<ICompanyMembership> {
    const response = await axiosCompanyInstance.post('companies/current/members/', payload);
    return response.data as ICompanyMembership;
  },

  async updateMember(membershipId: number, payload: IUpdateMembershipRequest): Promise<ICompanyMembership> {
    const response = await axiosCompanyInstance.patch(`companies/current/members/${membershipId}/`, payload);
    return response.data as ICompanyMembership;
  },

  async removeMember(membershipId: number): Promise<void> {
    await axiosCompanyInstance.delete(`companies/current/members/${membershipId}/`);
  },
};
