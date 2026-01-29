import { useState, type ReactNode } from "react";
import { AuthContext } from "./contexts";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [email, setEmail] = useState<string>();
  const [accessToken, setAccessToken] = useState<string>();

  const login = (email: string, password: string) => {
    setEmail(email)
    setAccessToken(email)
    console.log(password);
    console.log(accessToken);
    if (accessToken) localStorage.setItem("accessToken", accessToken);
  };

  const logout = () => {
    setEmail(undefined)
    setAccessToken(undefined)
  };

  return (
    <AuthContext.Provider value={{ email, accessToken, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}