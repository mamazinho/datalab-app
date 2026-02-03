import { useState, type ReactNode } from "react";
import { AuthContext } from "./contexts";
import { type ILoginUserRequest } from '../../services/datalab-api/authResource';
import { DatalabAPI } from "../../services/datalab-api";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [email, setEmail] = useState<string>();
  const [accessToken, setAccessToken] = useState<string | undefined>(() => {
    const storedToken = localStorage.getItem("accessToken");
    return storedToken || undefined;
  });

  const login = async (emailPayload: string, passwordPayload: string) => {
    const loginData: ILoginUserRequest = {
      email: emailPayload,
      password: passwordPayload,
    };
    try {
      const response = await DatalabAPI.AuthResource.login(loginData)
      setEmail(emailPayload)
      setAccessToken(response.access_token)
      if (response.access_token) localStorage.setItem("accessToken", response.access_token);
      console.log("pwd",passwordPayload);
      console.log("access", response.access_token);
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const logout = () => {
    setEmail(undefined)
    setAccessToken(undefined)
    localStorage.removeItem("accessToken");
  };

  return (
    <AuthContext.Provider value={{ email, accessToken, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}