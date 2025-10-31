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