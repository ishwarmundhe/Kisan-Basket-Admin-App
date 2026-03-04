import React, { createContext, useState, useEffect } from "react";
import { localStore } from "../localStore/LocalStore";
import { setLogout } from "./AuthService";
import { useDispatch } from "react-redux";
import {
  setToken as setAuthToken,
  setUser as setAuthUser,
  logout as logoutAuth,
} from "../redux/slices/authSlice";
import { GRAPHQL_BASE_URL, API_BASE_URL } from "@env";

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

        // Sync to Redux Store
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

  const login = async (userData, userToken, refreshToken) => {
    try {
      await localStore.setUserInfo(userData);
      await localStore.setToken(userToken);
      await localStore.setRefreshToken(refreshToken);

      // Update Local State
      setToken(userToken);
      setUser(userData);

      // Update Redux State
      dispatch(setAuthToken(userToken));
      dispatch(setAuthUser(userData));
    } catch (error) {
      console.error("Failed to save login state:", error);
    }
  };

  const logout = async () => {
    try {
      await localStore.clear();

      // Clear Local State
      setToken(null);
      setUser(null);

      // Clear Redux State
      dispatch(logoutAuth());

      // Clear RTK Query Cache (Optional but recommended)
      // dispatch(ledgerApi.util.resetApiState());
    } catch (error) {
      console.error("Failed to clear local storage:", error);
    }
  };

  const refreshUserToken = async () => {
    try {
      const refreshToken = await localStore.getRefreshToken();

      if (!refreshToken) {
        throw new Error("No refresh token available");
      }

      const response = await fetch(GRAPHQL_BASE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: `
            mutation refreshToken($refreshToken: String!) {
              tokenRefresh(refreshToken: $refreshToken) {
                token
                errors {
                  code
                  field
                  message
                }
              }
            }
          `,
          variables: { refreshToken },
        }),
      });

      const jsonResponse = await response.json();
      const data = jsonResponse?.data;

      if (data?.tokenRefresh?.errors?.length > 0) {
        console.log("Refresh logic failed on backend validation");
        throw new Error(data.tokenRefresh.errors[0].message);
      }

      const newToken = data?.tokenRefresh?.token;

      if (newToken) {
        await localStore.setToken(newToken);
        setToken(newToken);
        dispatch(setAuthToken(newToken));

        return newToken;
      } else {
        throw new Error("Token refresh returned no token");
      }
    } catch (error) {
      console.error("Token Refresh Failed:", error);
      await logout();
      Alert.alert("Session Expired", "Please login again.");
      return null;
    }
  };

  useEffect(() => {
    setLogout(logout);
  }, [logout]);

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
