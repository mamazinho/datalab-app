import { axiosInstance, axiosPrivateInstance } from "./axios";

export interface IRegisterUserRequest {
  name: string;
  email: string;
  password: string;
}

export interface IUserResponse {
  id: number;
  name: string;
  email: string;
  status: string;
  role: string;
  created_at: string;
  updated_at: string;
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
  async me(): Promise<IUserResponse> {
    const response = await axiosPrivateInstance.get(
      `users/me`
    )
    return response.data as IUserResponse;
  },
  async forgotPassword(forgotPasswordData: IForgotPasswordRequest): Promise<void> {
    const response = await axiosPrivateInstance.post(
      `users/forgot-password`,
      forgotPasswordData
    )
    if (response.status !== 204) throw new Error("Failed to send forgot password request");
  },
  async changePassword(changePasswordData: IChangePasswordRequest): Promise<IUserResponse> {
    const response = await axiosPrivateInstance.post(
      `users/change-password`,
      changePasswordData
    )
    return response.data as IUserResponse;
  },
}