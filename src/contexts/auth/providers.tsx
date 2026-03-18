import { useCallback, useMemo, useState, type ReactNode } from "react";
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

  const getMe = useCallback(async (): Promise<IUserResponse> => {
    try {
      const storedUser = localStorage.getItem("myData");
      if (storedUser) {
        const user = JSON.parse(storedUser) as IUserResponse;
        setMe(user);
        return user;
      }

      const user = await DatalabAPI.UsersResource.me() as IUserResponse;
      setMe(user);
      if (user) localStorage.setItem("myData", JSON.stringify(user));
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
      await getMe();
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  }, [getMe]);

  const logout = useCallback(() => {
    setAccessToken(undefined)
    setMe({} as IUserResponse);
    localStorage.removeItem("accessToken");
    localStorage.removeItem("myData");
  }, []);

  const contextValue = useMemo(
    () => ({ accessToken, me, login, logout, getMe }),
    [accessToken, me, login, logout, getMe],
  );

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}