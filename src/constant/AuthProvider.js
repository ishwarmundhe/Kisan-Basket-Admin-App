import React, { createContext, useState, useEffect } from 'react';
import { localStore } from '../localStore/LocalStore';
import { setLogout } from './AuthService';

export const AuthContext = createContext();

 export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [globalRefresh, setGlobalRefresh] = useState(false); // NEW

  const loadUser = async () => {
    const savedToken = await localStore.getToken();
    setToken(savedToken);
    setIsLoading(false);
  };

  useEffect(() => {
    loadUser();
  }, []);

  const login = async (user, token, refreshToken) => {
    await localStore.setUserInfo(user);
    await localStore.setToken(token);
    await localStore.setRefreshToken(refreshToken);
    setToken(token);
  };

  const logout = async () => {
    await localStore.clear();
    setToken(null);
  };
  useEffect(() => {
    setLogout(logout);
  }, [logout]);

  return (
    <AuthContext.Provider value={{ token, login, logout, isLoading,  globalRefresh ,setGlobalRefresh, }}>
      {children}
    </AuthContext.Provider>
  );
};
