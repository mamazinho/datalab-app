import type { ILoginUserResponse } from "../services/datalab-api/authResource";

export const SOCIAL_AUTH_CHANNEL = 'auth_channel';

export interface ISocialLoginCallbackEvent {
  type: string;
  response: ILoginUserResponse;
}