import { useState, type ReactNode } from "react";
import { AuthContext } from "./contexts";
import { type ILoginUserResponse } from '../../services/datalab-api/authResource';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [accessToken, setAccessToken] = useState<string | undefined>(() => {
    const storedToken = localStorage.getItem("accessToken");
    return storedToken || undefined;
  });

  const login = (loginResponse: ILoginUserResponse) => {
    try {
      setAccessToken(loginResponse.access_token)
      if (loginResponse.access_token) localStorage.setItem("accessToken", loginResponse.access_token);
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const logout = () => {
    setAccessToken(undefined)
    localStorage.removeItem("accessToken");
  };

  return (
    <AuthContext.Provider value={{ accessToken, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}