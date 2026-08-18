import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { AuthContext } from "./contexts";
import { setSessionExpiredHandler } from "../../services/datalab-api/axios";
import { type ILoginUserResponse } from '../../services/datalab-api/authResource';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const queryClient = useQueryClient();
  const [accessToken, setAccessToken] = useState<string | undefined>(() => {
    const storedToken = localStorage.getItem("accessToken");
    return storedToken || undefined;
  });

  const login = useCallback(async (loginResponse: ILoginUserResponse) => {
    setAccessToken(loginResponse.access_token);
    if (loginResponse.access_token) localStorage.setItem("accessToken", loginResponse.access_token);
  }, []);

  const logout = useCallback(() => {
    setAccessToken(undefined);
    localStorage.removeItem("accessToken");
    // Dados do usuário anterior não podem vazar para a próxima sessão
    queryClient.clear();
  }, [queryClient]);

  // Permite ao interceptor axios encerrar a sessão via React (sem reload de página)
  // quando o backend responde 401 — o token some e os guards mandam para /login.
  useEffect(() => {
    setSessionExpiredHandler(logout);
    return () => setSessionExpiredHandler(null);
  }, [logout]);

  const contextValue = useMemo(
    () => ({ accessToken, login, logout }),
    [accessToken, login, logout],
  );

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}
