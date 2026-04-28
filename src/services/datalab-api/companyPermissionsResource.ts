import { axiosCompanyInstance } from "./axios";
import type { IRoutePermission, IMembershipPermission } from "./usersResource";

export const CompanyPermissionsResource = {
  async listRoutePermissions(): Promise<IRoutePermission[]> {
    const response = await axiosCompanyInstance.get('companies/current/route-permissions/');
    return response.data as IRoutePermission[];
  },

  async listMemberPermissions(membershipId: number): Promise<IMembershipPermission[]> {
    const response = await axiosCompanyInstance.get(`companies/current/members/${membershipId}/permissions/`);
    return response.data as IMembershipPermission[];
  },

  async grantPermission(membershipId: number, routePermissionId: number): Promise<IMembershipPermission> {
    const response = await axiosCompanyInstance.post(
      `companies/current/members/${membershipId}/permissions/${routePermissionId}/`
    );
    return response.data as IMembershipPermission;
  },

  async revokePermission(membershipId: number, routePermissionId: number): Promise<void> {
    await axiosCompanyInstance.delete(
      `companies/current/members/${membershipId}/permissions/${routePermissionId}/`
    );
  },
};
