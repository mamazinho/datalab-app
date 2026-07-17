import { createContext, useContext } from "react";
import type { ILoginUserResponse } from "../../services/datalab-api/authResource";
import type { IUserResponse } from "../../services/datalab-api/usersResource";

interface IAuthContextProps {
  accessToken: string | undefined;
  me: IUserResponse | null;
  isAuthLoading: boolean;

  login: (loginResponse: ILoginUserResponse) => Promise<void>;
  logout: () => void;

  getMe: () => Promise<IUserResponse>;
}

export const AuthContext = createContext<IAuthContextProps | null>(null);

export const useAuthContext = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }

  return context;
};
