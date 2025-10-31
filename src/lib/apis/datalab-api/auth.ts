import type { ILoginUserRequest, ILoginUserResponse } from "$home/lib/types/auth";
import { axiosInstance } from "./axios";


export const AuthResource = {
  async login(loginData: ILoginUserRequest): Promise<ILoginUserResponse> {
    const response = await axiosInstance.post(
      `auth/login/`,
      loginData,
      { withCredentials: true }
    )
    return response.data as ILoginUserResponse;
  },
  async refresh_token(): Promise<ILoginUserResponse> {
    const response = await axiosInstance.post(
      `auth/refresh/`,
      {},
      { withCredentials: true }
    )
    return response.data as ILoginUserResponse;
  },
  async logout() {
    const response = await axiosInstance.post(
      `auth/logout/`,
      {},
      { withCredentials: true }
    )
    if (response.status === 204) return null;
  },
}