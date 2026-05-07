import { axiosInstance, axiosPrivateInstance } from "./axios";

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

// Membership mínimo que vem embutido na lista de empresas do usuário (/users/me)
// Espelho de RetrieveUserMembership no backend
export interface IUserMembership {
  id: number;
  membership_role: CompanyMembershipRole;
  status: CompanyMembershipStatus;
  created_at: string;
  updated_at: string;
}

// Empresa da lista do usuário (/users/me) — espelho de RetrieveUserCompany
export interface IUserCompany {
  id: number;
  name: string;
  status: string;
  created_at: string;
  updated_at: string;
  membership: IUserMembership;
}

export interface IRoutePermission {
  id: number;
  method: string;
  path: string;
  name: string;
  description: string;
  tag: string | null;
  created_at: string;
  updated_at: string;
}

export interface IMembershipPermission {
  id: number;
  membership_id: number;
  route_permission_id: number;
  created_at: string;
  updated_at: string;
  route_permission: IRoutePermission;
}

export interface IUserInvite {
  id: number;
  email: string;
  company_id: number;
  invited_by_user_id: number;
  membership_role: CompanyMembershipRole;
  status: InviteStatus;
  created_at: string;
  updated_at: string;
  company?: IUserCompany | null;
  invited_by?: { id: number; name: string; email: string } | null;
  permissions: IRoutePermission[];
}

export interface IUserResponse {
  id: number;
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
  async resendConfirmationCode(userId: number): Promise<IUserResponse> {
    const response = await axiosInstance.post(
      `users/${userId}/resend-confirmation`
    )
    return response.data as IUserResponse;
  },
  async confirmAccount(userId: number, confirmAccountData: IConfirmAccountRequest): Promise<IUserResponse> {
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
  async acceptInvite(inviteId: number): Promise<IUserInvite> {
    const response = await axiosPrivateInstance.post(`users/me/invites/${inviteId}/accept/`);
    return response.data as IUserInvite;
  },

  async declineInvite(inviteId: number): Promise<IUserInvite> {
    const response = await axiosPrivateInstance.post(`users/me/invites/${inviteId}/decline/`);
    return response.data as IUserInvite;
  },
}