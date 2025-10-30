import type { ILoginUserRequest, ILoginUserResponse } from "$home/lib/types/auth";
import { axiosInstance } from "./axios";


export const AuthResource = {
  async login(loginData: ILoginUserRequest): Promise<ILoginUserResponse> {
    const response = await axiosInstance.post(
      `auth/login/`,
      loginData
    )
    return response.data as ILoginUserResponse;
  },
}