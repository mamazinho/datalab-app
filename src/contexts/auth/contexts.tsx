import { createContext, useContext } from "react";

interface IAuthContextProps {
  email: string | undefined;
  accessToken: string | undefined;

  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext({} as IAuthContextProps);

export const useAuthContext = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }

  return context;
};
