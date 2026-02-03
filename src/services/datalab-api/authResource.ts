import { axiosInstance } from "./axios";

export interface ILoginUserRequest {
  email: string;
  password: string;
}

export interface ILoginUserResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
}

export const AuthResource = {
  async login(userData: ILoginUserRequest): Promise<ILoginUserResponse> {
    const response = await axiosInstance.post(
      `auth/login/`,
      userData
    )
    return response.data as ILoginUserResponse;
  },
}