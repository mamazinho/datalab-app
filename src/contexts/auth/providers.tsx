import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import axios from "axios";
import { AuthContext } from "./contexts";
import { type ILoginUserResponse } from '../../services/datalab-api/authResource';
import { DatalabAPI } from "../../services/datalab-api";
import type { IUserResponse } from "../../services/datalab-api/usersResource";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [accessToken, setAccessToken] = useState<string | undefined>(() => {
    const storedToken = localStorage.getItem("accessToken");
    return storedToken || undefined;
  });
  const [me, setMe] = useState({} as IUserResponse);
  // Começa como `true` se há token em cache, para evitar redirects prematuros
  const [isAuthLoading, setIsAuthLoading] = useState(() => !!localStorage.getItem("accessToken"));

  const getMe = useCallback(async (): Promise<IUserResponse> => {
    try {
      const user = await DatalabAPI.UsersResource.me() as IUserResponse;
      setMe(user);
      return user;
    } catch (error) {
      console.error("Get me error:", error);
      throw error;
    }
  }, []);

  const login = useCallback(async (loginResponse: ILoginUserResponse) => {
    try {
      setAccessToken(loginResponse.access_token)
      if (loginResponse.access_token) localStorage.setItem("accessToken", loginResponse.access_token);
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  }, []);

  const logout = useCallback(() => {
    setAccessToken(undefined);
    setMe({} as IUserResponse);
    setIsAuthLoading(false);
    localStorage.removeItem("accessToken");
  }, []);

  useEffect(() => {
    if (!accessToken) {
      setMe({} as IUserResponse);
      setIsAuthLoading(false);
      return;
    }

    setIsAuthLoading(true);
    getMe()
      .catch((error: unknown) => {
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          logout();
        }
      })
      .finally(() => setIsAuthLoading(false));
  }, [accessToken, getMe, logout]);

  const contextValue = useMemo(
    () => ({ accessToken, me, isAuthLoading, login, logout, getMe }),
    [accessToken, me, isAuthLoading, login, logout, getMe],
  );

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}