export interface ILoginUserRequest {
  email: string;
  password: string;
}

export interface ILoginUserData {
  id: number;
  email: string;
}

export interface ILoginUserResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
  user: ILoginUserData;
}