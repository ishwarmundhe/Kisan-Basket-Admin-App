import { useEffect, useRef, useContext } from "react";
import { AppState } from "react-native";
import { jwtDecode } from "jwt-decode";
import { localStore } from "../utils/localStore";
import { AuthContext } from "../constant/AuthProvider";

export const useTokenManager = () => {
  const appState = useRef(AppState.currentState);

  const { refreshUserToken, logout } = useContext(AuthContext);

  useEffect(() => {
    const verifyAndRefreshToken = async () => {
      try {
        const token = await localStore.getToken();
        if (!token) return;

        const decodedToken = jwtDecode(token);
        const currentTime = Date.now() / 1000;

        if (decodedToken.exp < currentTime + 120) {
          await refreshUserToken();
        }
      } catch (error) {
        await logout();
      }
    };

    verifyAndRefreshToken();

    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === "active"
      ) {
        verifyAndRefreshToken();
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [refreshUserToken, logout]);
};
