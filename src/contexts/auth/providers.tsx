import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { AuthContext } from "./contexts";
import { setSessionExpiredHandler } from "../../services/datalab-api/axios";
import { AuthResource, type ILoginUserResponse } from '../../services/datalab-api/authResource';

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
    // The refresh token lives in an httpOnly cookie that only the backend can clear
    AuthResource.logout().catch(() => undefined);
    setAccessToken(undefined);
    localStorage.removeItem("accessToken");
    // The previous user's data must not leak into the next session
    queryClient.clear();
  }, [queryClient]);

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
