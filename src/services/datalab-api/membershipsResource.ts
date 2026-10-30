import { axiosCompanyInstance } from "./axios";
import type { UUID7 } from "../../types/ids";
import type { Provider } from "../../types/integrations";
import type { ICompany } from "./companiesResource";
import type {
  IMembershipRoutePermission,
  IMembershipProviderPermission,
  IProviderPermission,
  IRoutePermission,
  IUserInvite,
  IUserMembership,
} from "./usersResource";

export interface IMembershipUser {
  id: UUID7;
  name: string;
  email: string;
}

// RetrieveMembership mirror
export interface ICompanyMembership extends IUserMembership {
  user_id: UUID7;
  company_id: UUID7;
  user?: IMembershipUser | null;
}

// RetrieveCurrentMembership mirror. route_permissions are already flattened, unlike the grant rows of listMemberRoutePermissions.
export interface ICurrentMembership extends ICompanyMembership {
  company: ICompany | null;
  route_permissions: IRoutePermission[];
  // Already resolved: the owner gets the whole catalog, a member only what was granted
  provider_permissions: Partial<Record<Provider, IProviderPermission[]>>;
}

// PermissionSelection mirror
export interface IPermissionSelection {
  route_permissions: UUID7[];
  provider_permissions: UUID7[];
}

export interface ICreateInviteRequest extends IPermissionSelection {
  emails: string[];
}

export const MembershipsResource = {
  async getCurrentMembership(): Promise<ICurrentMembership> {
    const response = await axiosCompanyInstance.get("memberships/current/");
    return response.data as ICurrentMembership;
  },

  async listMembers(): Promise<ICompanyMembership[]> {
    const response = await axiosCompanyInstance.get("memberships/members/");
    return response.data as ICompanyMembership[];
  },

  async removeMember(membershipId: UUID7): Promise<void> {
    await axiosCompanyInstance.delete(`memberships/members/${membershipId}/`);
  },

  async transferOwnership(newOwnerMembershipId: UUID7): Promise<ICompanyMembership> {
    const response = await axiosCompanyInstance.post('memberships/transfer-ownership/', {
      new_owner_membership_id: newOwnerMembershipId,
    });
    return response.data as ICompanyMembership;
  },

  async listRoutePermissions(): Promise<IRoutePermission[]> {
    const response = await axiosCompanyInstance.get("memberships/route-permissions/");
    return response.data as IRoutePermission[];
  },

  async listMemberRoutePermissions(membershipId: UUID7): Promise<IMembershipRoutePermission[]> {
    const response = await axiosCompanyInstance.get(
      `memberships/members/${membershipId}/route-permissions/`,
    );
    return response.data as IMembershipRoutePermission[];
  },

  // Replaces both sets at once; an owner gets 400 because owners implicitly have every permission
  async updateMemberPermissions(membershipId: UUID7, payload: IPermissionSelection): Promise<void> {
    await axiosCompanyInstance.put(`memberships/members/${membershipId}/permissions/`, payload);
  },

  async listProviderPermissions(): Promise<IProviderPermission[]> {
    const response = await axiosCompanyInstance.get("memberships/provider-permissions/");
    return response.data as IProviderPermission[];
  },

  async listMemberProviderPermissions(
    membershipId: UUID7,
  ): Promise<IMembershipProviderPermission[]> {
    const response = await axiosCompanyInstance.get(
      `memberships/members/${membershipId}/provider-permissions/`,
    );
    return response.data as IMembershipProviderPermission[];
  },

  async listInvites(): Promise<IUserInvite[]> {
    const response = await axiosCompanyInstance.get("memberships/invites/");
    return response.data as IUserInvite[];
  },

  async getInvite(inviteId: UUID7): Promise<IUserInvite> {
    const response = await axiosCompanyInstance.get(`memberships/invites/${inviteId}/`);
    return response.data as IUserInvite;
  },

  async upsertInvite(payload: ICreateInviteRequest): Promise<IUserInvite[]> {
    const response = await axiosCompanyInstance.put("memberships/invites/", payload);
    return response.data as IUserInvite[];
  },

  async deleteInvite(inviteId: UUID7): Promise<void> {
    await axiosCompanyInstance.delete(`memberships/invites/${inviteId}/`);
  },
};
