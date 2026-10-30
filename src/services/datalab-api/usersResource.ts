import { axiosInstance, axiosPrivateInstance } from "./axios";
import type { UUID7 } from "../../types/ids";
import type { Provider, ProviderPermissionKey } from "../../types/integrations";

export interface IRegisterUserRequest {
  name: string;
  email: string;
  phone_number: string;
  password: string;
}

export interface IUserConfig {
  theme: 'light' | 'dark' | 'system';
}

export type CompanyMembershipRole = 'owner' | 'member';
export type CompanyMembershipStatus = 'active' | 'inactive';
export type InviteStatus = 'pending' | 'accepted' | 'declined';

// RetrieveUserMembership mirror
export interface IUserMembership {
  id: UUID7;
  membership_role: CompanyMembershipRole;
  status: CompanyMembershipStatus;
  created_at: string;
  updated_at: string;
}

// RetrieveUserCompany mirror
export interface IUserCompany {
  id: UUID7;
  name: string;
  status: string;
  created_at: string;
  updated_at: string;
  membership: IUserMembership;
}

export interface IRoutePermission {
  id: UUID7;
  method: string;
  path: string;
  name: string;
  description: string;
  tag: string | null;
  created_at: string;
  updated_at: string;
}

export interface IMembershipRoutePermission {
  id: UUID7;
  membership_id: UUID7;
  route_permission_id: UUID7;
  created_at: string;
  updated_at: string;
  route_permission: IRoutePermission;
}

// Checked by the core-api before an agent runs a write tool on this person's behalf; unrelated to route permissions
export interface IProviderPermission {
  id: UUID7;
  key: ProviderPermissionKey;
  provider: Provider;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

// RetrieveMembershipProviderPermission mirror
export interface IMembershipProviderPermission {
  id: UUID7;
  membership_id: UUID7;
  provider_permission_id: UUID7;
  created_at: string;
  updated_at: string;
  provider_permission: IProviderPermission;
}

// RetrieveMembershipInviteRoutePermission mirror
export interface IInviteRoutePermission {
  id: UUID7;
  invite_id: UUID7;
  route_permission_id: UUID7;
  created_at: string;
  updated_at: string;
  route_permission: IRoutePermission;
}

export interface IInviteProviderPermission {
  id: UUID7;
  invite_id: UUID7;
  provider_permission_id: UUID7;
  created_at: string;
  updated_at: string;
  provider_permission: IProviderPermission;
}

export interface IUserInvite {
  id: UUID7;
  email: string;
  company_id: UUID7;
  invited_by_membership_id: UUID7 | null;
  status: InviteStatus;
  created_at: string;
  updated_at: string;
  company?: IUserCompany | null;
  invited_by?: { id: UUID7; name: string; email: string } | null;
  route_permissions: IInviteRoutePermission[];
  provider_permissions: IInviteProviderPermission[];
}

export interface IUserResponse {
  id: UUID7;
  name: string;
  email: string;
  status: string;
  role: string;
  phone_number: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
  config: IUserConfig | null;
  invites: IUserInvite[];
  companies: IUserCompany[];
}

export interface IUpdateUserRequest {
  name: string | null;
  phone_number: string | null;
  avatar_url: string | null;
  config: IUserConfig | null;
  password?: string | null;
}

export interface IConfirmAccountRequest {
  code: string;
}

export interface IForgotPasswordRequest {
  user_email: string;
}

export interface IChangePasswordRequest {
  user_email: string;
  code: string;
  new_password: string;
}

export const UsersResource = {
  async create(userData: IRegisterUserRequest): Promise<IUserResponse> {
    const response = await axiosInstance.post(
      `users`,
      userData
    )
    return response.data as IUserResponse;
  },
  async resendConfirmationCode(userId: UUID7): Promise<IUserResponse> {
    const response = await axiosInstance.post(
      `users/${userId}/resend-confirmation`
    )
    return response.data as IUserResponse;
  },
  async confirmAccount(userId: UUID7, confirmAccountData: IConfirmAccountRequest): Promise<IUserResponse> {
    const response = await axiosInstance.post(
      `users/${userId}/confirm-account`,
      confirmAccountData
    )
    return response.data as IUserResponse;
  },
  async me(): Promise<IUserResponse> {
    const response = await axiosPrivateInstance.get(
      `users/me`
    )
    return response.data as IUserResponse;
  },
  async updateMe(updateData: Partial<IUpdateUserRequest>): Promise<IUserResponse> {
    const response = await axiosPrivateInstance.patch(
      `users/me`,
      updateData
    )
    return response.data as IUserResponse;
  },
  async deleteMe(): Promise<void> {
    await axiosPrivateInstance.delete('users/me/');
  },
  async forgotPassword(forgotPasswordData: IForgotPasswordRequest): Promise<void> {
    const response = await axiosInstance.post(
      `users/forgot-password`,
      forgotPasswordData
    )
    if (response.status !== 204) throw new Error("Failed to send forgot password request");
  },
  async changePassword(changePasswordData: IChangePasswordRequest): Promise<IUserResponse> {
    const response = await axiosInstance.post(
      `users/change-password`,
      changePasswordData
    )
    return response.data as IUserResponse;
  },
  async acceptInvite(inviteId: UUID7): Promise<IUserInvite> {
    const response = await axiosPrivateInstance.post(`users/me/invites/${inviteId}/accept/`);
    return response.data as IUserInvite;
  },

  async declineInvite(inviteId: UUID7): Promise<IUserInvite> {
    const response = await axiosPrivateInstance.post(`users/me/invites/${inviteId}/decline/`);
    return response.data as IUserInvite;
  },
}