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