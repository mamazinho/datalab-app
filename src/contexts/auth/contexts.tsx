import { createContext, useContext } from "react";
import type { ILoginUserResponse } from "../../services/datalab-api/authResource";

interface IAuthContextProps {
  accessToken: string | undefined;
  login: (loginResponse: ILoginUserResponse) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<IAuthContextProps | null>(null);

export const useAuthContext = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }

  return context;
};
