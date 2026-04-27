import React, { createContext, useState, useEffect } from "react";
import { Alert } from "react-native";
import { localStore } from "../utils/localStore";
import { setLogout, setTokenUpdater } from "./AuthService";
import { useDispatch } from "react-redux";
import {
  setToken as setAuthToken,
  setUser as setAuthUser,
  logout as logoutAuth,
} from "../redux/slices/authSlice";
import { GRAPHQL_BASE_URL } from "@env";
import { toast } from "sonner-native";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [globalRefresh, setGlobalRefresh] = useState(false);
  const dispatch = useDispatch();

  const loadUser = async () => {
    try {
      const savedToken = await localStore.getToken();
      const savedUserJson = await localStore.getUserInfo();

      if (savedToken && savedUserJson) {
        const parsedUser =
          typeof savedUserJson === "string"
            ? JSON.parse(savedUserJson)
            : savedUserJson;

        setToken(savedToken);
        setUser(parsedUser);
        dispatch(setAuthToken(savedToken));
        dispatch(setAuthUser(parsedUser));
      }
    } catch (e) {
      console.error("Load user error:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    setLogout(logout);
    setTokenUpdater((newToken) => {
      setToken(newToken);
      dispatch(setAuthToken(newToken));
    });
  }, []);

  const login = async (userData, userToken, refreshToken) => {
    try {
      await localStore.setUserInfo(userData);
      await localStore.setToken(userToken);
      await localStore.setRefreshToken(refreshToken);

      setToken(userToken);
      setUser(userData);
      dispatch(setAuthToken(userToken));
      dispatch(setAuthUser(userData));
    } catch (error) {
      console.error("Failed to save login state:", error);
    }
  };

  const logout = async () => {
    try {
      await localStore.clear();

      setToken(null);
      setUser(null);
      dispatch(logoutAuth());
    } catch (error) {
      console.error("Failed to clear local storage:", error);
    }
  };

  const refreshUserToken = async () => {
    try {
      const refreshToken = await localStore.getRefreshToken();

      if (!refreshToken) throw new Error("No refresh token available");

      const response = await fetch(GRAPHQL_BASE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: `
            mutation refreshToken($refreshToken: String!) {
              tokenRefresh(refreshToken: $refreshToken) {
                token
                errors { code field message }
              }
            }
          `,
          variables: { refreshToken },
        }),
      });

      const json = await response.json();
      const refreshData = json?.data?.tokenRefresh;

      if (refreshData?.errors?.length > 0) {
        throw new Error(refreshData.errors[0].message);
      }

      const newToken = refreshData?.token;

      if (!newToken) throw new Error("Token refresh returned no token");

      await localStore.setToken(newToken);
      setToken(newToken);
      dispatch(setAuthToken(newToken));

      return newToken;
    } catch (error) {
      await logout();
      toast.error("Session Expired", "Please login again.");
      return null;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        login,
        logout,
        isLoading,
        refreshUserToken,
        globalRefresh,
        setGlobalRefresh,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
