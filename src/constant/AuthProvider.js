import React, { createContext, useState, useEffect } from "react";
// Assuming localStore has 'getUserInfo' and 'setUserInfo'
import { localStore } from "../localStore/LocalStore";
import { setLogout } from "./AuthService";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [globalRefresh, setGlobalRefresh] = useState(false);

  const loadUser = async () => {
    try {
      const savedToken = await localStore.getToken();
      const savedUserJson = await localStore.getUserInfo();

      if (savedToken && savedUserJson) {
        setToken(savedToken);
        setUser(JSON.parse(savedUserJson));
      } else {
        setToken(null);
        setUser(null);
      }
    } catch (error) {
      console.error("Failed to load user state:", error);

      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  const login = async (user, token, refreshToken) => {
    try {
      await localStore.setUserInfo(user);
      await localStore.setToken(token);
      await localStore.setRefreshToken(refreshToken);

      setToken(token);
      setUser(user);
    } catch (error) {
      console.error("Failed to save login state:", error);
    }
  };

  const logout = async () => {
    try {
      await localStore.clear();
      setToken(null);
      setUser(null);
    } catch (error) {
      console.error("Failed to clear local storage:", error);
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
        globalRefresh,
        setGlobalRefresh,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
