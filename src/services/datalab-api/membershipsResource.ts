import { axiosCompanyInstance } from "./axios";
import type { UUID } from "../../types/ids";
import type { Provider } from "../../types/integrations";
import type { ICompany } from "./companiesResource";
import type {
  IMembershipPermission,
  IMembershipProviderPermission,
  IProviderPermission,
  IRoutePermission,
  IUserInvite,
  IUserMembership,
} from "./usersResource";

export interface IMembershipUser {
  id: UUID;
  name: string;
  email: string;
}

// Membership completo — espelho de RetrieveMembership no backend
export interface ICompanyMembership extends IUserMembership {
  user_id: UUID;
  company_id: UUID;
  user?: IMembershipUser | null;
}

// Membership atual — espelho de RetrieveCurrentMembership.
// Fonte única do usuário logado na empresa ativa: traz a company embutida e as
// permissões já ACHATADAS (RetrieveRoutePermission[]), diferente de
// listMemberPermissions, que devolve a linha de concessão. Não existe mais
// companies/current nem memberships/current/permissions separados.
export interface ICurrentMembership extends ICompanyMembership {
  company: ICompany | null;
  permissions: IRoutePermission[];
  // Dict POR PROVIDER (não lista) e já resolvido: owner recebe o catálogo
  // inteiro, membro só o que lhe foi concedido — se está aqui, pode.
  provider_permissions: Partial<Record<Provider, IProviderPermission[]>>;
}

export interface ICreateInviteRequest {
  emails: string[];
  permissions: UUID[];
  provider_permissions: UUID[];
}

export const MembershipsResource = {
  // ── Current ──────────────────────────────────────────────────────────────────

  // Empresa vai no X-Company-Id via interceptor (como todas as rotas de company).
  async getCurrentMembership(): Promise<ICurrentMembership> {
    const response = await axiosCompanyInstance.get("memberships/current/");
    return response.data as ICurrentMembership;
  },

  // ── Members ─────────────────────────────────────────────────────────────────

  async listMembers(): Promise<ICompanyMembership[]> {
    const response = await axiosCompanyInstance.get("memberships/members/");
    return response.data as ICompanyMembership[];
  },

  async removeMember(membershipId: UUID): Promise<void> {
    await axiosCompanyInstance.delete(`memberships/members/${membershipId}/`);
  },

  // ── Permissions ──────────────────────────────────────────────────────────────

  async listRoutePermissions(): Promise<IRoutePermission[]> {
    const response = await axiosCompanyInstance.get("memberships/route-permissions/");
    return response.data as IRoutePermission[];
  },

  async listMemberPermissions(membershipId: UUID): Promise<IMembershipPermission[]> {
    const response = await axiosCompanyInstance.get(
      `memberships/members/${membershipId}/permissions/`,
    );
    return response.data as IMembershipPermission[];
  },

  async grantPermission(
    membershipId: UUID,
    routePermissionId: UUID,
  ): Promise<IMembershipPermission> {
    const response = await axiosCompanyInstance.post(
      `memberships/members/${membershipId}/permissions/${routePermissionId}/`,
    );
    return response.data as IMembershipPermission;
  },

  async revokePermission(membershipId: UUID, routePermissionId: UUID): Promise<void> {
    await axiosCompanyInstance.delete(
      `memberships/members/${membershipId}/permissions/${routePermissionId}/`,
    );
  },

  // ── Provider permissions ─────────────────────────────────────────────────────
  // Mesmo modelo das route permissions, só que para o que não é rota da Datalab.
  // Conceder/revogar para um OWNER devolve 400 (ele tem todas implicitamente).

  async listProviderPermissions(): Promise<IProviderPermission[]> {
    const response = await axiosCompanyInstance.get("memberships/provider-permissions/");
    return response.data as IProviderPermission[];
  },

  async listMemberProviderPermissions(
    membershipId: UUID,
  ): Promise<IMembershipProviderPermission[]> {
    const response = await axiosCompanyInstance.get(
      `memberships/members/${membershipId}/provider-permissions/`,
    );
    return response.data as IMembershipProviderPermission[];
  },

  async grantProviderPermission(
    membershipId: UUID,
    providerPermissionId: UUID,
  ): Promise<IMembershipProviderPermission> {
    const response = await axiosCompanyInstance.post(
      `memberships/members/${membershipId}/provider-permissions/${providerPermissionId}/`,
    );
    return response.data as IMembershipProviderPermission;
  },

  async revokeProviderPermission(
    membershipId: UUID,
    providerPermissionId: UUID,
  ): Promise<void> {
    await axiosCompanyInstance.delete(
      `memberships/members/${membershipId}/provider-permissions/${providerPermissionId}/`,
    );
  },

  // ── Invites ──────────────────────────────────────────────────────────────────

  async listInvites(): Promise<IUserInvite[]> {
    const response = await axiosCompanyInstance.get("memberships/invites/");
    return response.data as IUserInvite[];
  },

  async getInvite(inviteId: UUID): Promise<IUserInvite> {
    const response = await axiosCompanyInstance.get(`memberships/invites/${inviteId}/`);
    return response.data as IUserInvite;
  },

  async upsertInvite(payload: ICreateInviteRequest): Promise<IUserInvite[]> {
    const response = await axiosCompanyInstance.put("memberships/invites/", payload);
    return response.data as IUserInvite[];
  },

  async deleteInvite(inviteId: UUID): Promise<void> {
    await axiosCompanyInstance.delete(`memberships/invites/${inviteId}/`);
  },
};
