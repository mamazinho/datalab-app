import type { IUserResponse, IRegisterUserRequest } from "$home/lib/types/users";
import { axiosInstance, axiosPrivateInstance } from "./axios";


export const UsersResource = {
  async create(userData: IRegisterUserRequest): Promise<IUserResponse> {
    const response = await axiosInstance.post(
      `users/`,
      userData
    )
    return response.data as IUserResponse;
  },
  async me(): Promise<IUserResponse> {
    const response = await axiosPrivateInstance.get(
      `users/me/`
    )
    return response.data as IUserResponse;
  },
}