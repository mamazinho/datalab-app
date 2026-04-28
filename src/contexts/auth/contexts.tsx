import { createContext, useContext } from "react";
import type { ILoginUserResponse } from "../../services/datalab-api/authResource";
import type { IUserResponse } from "../../services/datalab-api/usersResource";

interface IAuthContextProps {
  accessToken: string | undefined;
  me: IUserResponse;
  isAuthLoading: boolean;

  login: (loginResponse: ILoginUserResponse) => Promise<void>;
  logout: () => void;

  getMe: () => Promise<IUserResponse>;
}


export const AuthContext = createContext({} as IAuthContextProps);

export const useAuthContext = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }

  return context;
};
