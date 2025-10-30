import type { IRegisterUserResponse, IRegisterUserRequest } from "$home/lib/types/users";
import { axiosInstance } from "./axios";


export const UsersResource = {
  async create(userData: IRegisterUserRequest): Promise<IRegisterUserResponse> {
    const response = await axiosInstance.post(
      `users/`,
      userData
    )
    return response.data as IRegisterUserResponse;
  },
}