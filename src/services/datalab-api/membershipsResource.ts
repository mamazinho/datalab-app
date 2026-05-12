import { axiosCompanyInstance } from "./axios";
import type { ICompany } from "./companiesResource";
import type {
  IMembershipPermission,
  IRoutePermission,
  IUserInvite,
  IUserMembership,
} from "./usersResource";

export interface IMembershipUser {
  id: number;
  name: string;
  email: string;
}

// Membership completo — espelho de RetrieveMembership no backend
export interface ICompanyMembership extends IUserMembership {
  user_id: number;
  company_id: number;
  user?: IMembershipUser | null;
}

// Membership com company embutida — espelho de RetrieveCurrentMembership
export interface ICurrentMembership extends ICompanyMembership {
  company: ICompany | null;
}

export interface ICreateInviteRequest {
  emails: string[];
  permissions: number[];
}

export const MembershipsResource = {
  // ── Current ──────────────────────────────────────────────────────────────────

  async getCurrentMembership(): Promise<ICurrentMembership | null> {
    const response = await axiosCompanyInstance.get("memberships/current/");
    return response.data as ICurrentMembership | null;
  },

  async getCurrentPermissions(): Promise<IMembershipPermission[]> {
    const response = await axiosCompanyInstance.get("memberships/current/permissions/");
    return response.data as IMembershipPermission[];
  },

  // ── Members ─────────────────────────────────────────────────────────────────

  async listMembers(): Promise<ICompanyMembership[]> {
    const response = await axiosCompanyInstance.get("memberships/members/");
    return response.data as ICompanyMembership[];
  },

  async removeMember(membershipId: number): Promise<void> {
    await axiosCompanyInstance.delete(`memberships/members/${membershipId}/`);
  },

  // ── Permissions ──────────────────────────────────────────────────────────────

  async listRoutePermissions(): Promise<IRoutePermission[]> {
    const response = await axiosCompanyInstance.get("memberships/route-permissions/");
    return response.data as IRoutePermission[];
  },

  async listMemberPermissions(membershipId: number): Promise<IMembershipPermission[]> {
    const response = await axiosCompanyInstance.get(
      `memberships/members/${membershipId}/permissions/`,
    );
    return response.data as IMembershipPermission[];
  },

  async grantPermission(
    membershipId: number,
    routePermissionId: number,
  ): Promise<IMembershipPermission> {
    const response = await axiosCompanyInstance.post(
      `memberships/members/${membershipId}/permissions/${routePermissionId}/`,
    );
    return response.data as IMembershipPermission;
  },

  async revokePermission(membershipId: number, routePermissionId: number): Promise<void> {
    await axiosCompanyInstance.delete(
      `memberships/members/${membershipId}/permissions/${routePermissionId}/`,
    );
  },

  // ── Invites ──────────────────────────────────────────────────────────────────

  async listInvites(): Promise<IUserInvite[]> {
    const response = await axiosCompanyInstance.get("memberships/invites/");
    return response.data as IUserInvite[];
  },

  async getInvite(inviteId: number): Promise<IUserInvite> {
    const response = await axiosCompanyInstance.get(`memberships/invites/${inviteId}/`);
    return response.data as IUserInvite;
  },

  async upsertInvite(payload: ICreateInviteRequest): Promise<IUserInvite[]> {
    const response = await axiosCompanyInstance.put("memberships/invites/", payload);
    return response.data as IUserInvite[];
  },

  async deleteInvite(inviteId: number): Promise<void> {
    await axiosCompanyInstance.delete(`memberships/invites/${inviteId}/`);
  },
};
