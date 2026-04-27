import AsyncStorage from "@react-native-async-storage/async-storage";
import { toast } from "sonner-native";
export const localStore = {
  setToken: async (token) => {
    try {
      await AsyncStorage.setItem("token", token);
    } catch (err) {
      console.error("Error storing token:", err);
    }
  },

  getToken: async () => {
    try {
      return await AsyncStorage.getItem("token");
    } catch (err) {
      toast.error("Error retrieving token:", err);
      return null;
    }
  },
  setRefreshToken: async (refreshToken) => {
    try {
      await AsyncStorage.setItem("refreshToken", refreshToken);
    } catch (err) {
      toast.error("Error refresh token:", err);
    }
  },
  getRefreshToken: async () => {
    try {
      return await AsyncStorage.getItem("refreshToken");
    } catch (err) {
      toast.error("Error retrieving refresh token:", err);
      return null;
    }
  },
  removeRefreshToken: async () => {
    try {
      await AsyncStorage.removeItem("refreshToken");
    } catch (err) {
      toast.error("remove refresh token failed", err);
    }
  },
  removeToken: async () => {
    try {
      await AsyncStorage.removeItem("token");
    } catch (err) {
      toast.error("Error removing token", err);
    }
  },
  setUserInfo: async (user) => {
    try {
      const userStr = JSON.stringify(user);
      await AsyncStorage.setItem("user", userStr);
    } catch (err) {
      toast.error("user not store localstore due to issue");
    }
  },
  getUserInfo: async () => {
    try {
      const userStr = await AsyncStorage.getItem("user");
      return userStr ? JSON.parse(userStr) : null;
    } catch (err) {
      toast.error("user get Info error", err);
    }
  },
  clear: async () => {
    try {
      await AsyncStorage.clear();
      // toast.success("Local storage cleared");
    } catch (err) {
      toast.error("Failed to clear local storage", err);
    }
  },
  setTheme: async (theme) => {
    try {
      AsyncStorage.setItem("theme", theme);
    } catch (err) {
      toast.error("theme set error");
    }
  },
  getCurrentTheme: async () => {
    try {
      return await AsyncStorage.getItem("theme");
    } catch (err) {
      toast.error("theme geting error");
    }
  },
};

export default localStore;
