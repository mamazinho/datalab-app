import type { ILoginUserRequest } from "$home/lib/types/auth";
import { axiosInstance } from "./axios";


export const AuthResource = {
  async login(loginData: ILoginUserRequest): Promise<ReadableStream<Uint8Array>> {
    const response = await axiosInstance.post(
      `auth/login/`,
      loginData
    )
    return response.data;
  },
}