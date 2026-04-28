import { axiosPrivateInstance } from "./axios";
import type { IUserInvite } from "./usersResource";

export const InvitesResource = {
  async acceptInvite(inviteId: number): Promise<IUserInvite> {
    const response = await axiosPrivateInstance.post(`invites/${inviteId}/accept/`);
    return response.data as IUserInvite;
  },

  async declineInvite(inviteId: number): Promise<IUserInvite> {
    const response = await axiosPrivateInstance.post(`invites/${inviteId}/decline/`);
    return response.data as IUserInvite;
  },
};
