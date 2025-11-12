import axios from "axios";
import { localStore } from "../localStore/LocalStore";
import { API_BASE_URL } from "@env";
import { bareClient } from "../client/client";
import { REFRESH_TOKEN_MUTATION } from "../graphql/Mutation";
import { toast } from "sonner-native";

// Token refresh state control
let isRefreshing = false;
let failedRequestsQueue = [];

const processQueue = (error, token = null) => {
  failedRequestsQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve(token);
    }
  });
  failedRequestsQueue = [];
};

// Axios instance
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
axiosInstance.interceptors.request.use(
  async (config) => {
    const token = await localStore.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedRequestsQueue.push({ resolve, reject });
      })
        .then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return axiosInstance(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const refreshToken = await localStore.getRefreshToken();
      if (!refreshToken) throw new Error("No refresh token available");

      const result = await bareClient.mutate({
        mutation: REFRESH_TOKEN_MUTATION,
        variables: { refreshToken },
      });

      const newToken = result?.data?.tokenRefresh?.token;
      const newRefreshToken = result?.data?.tokenRefresh?.refreshToken;

      if (!newToken) throw new Error("Token refresh failed");

      await Promise.all([
        localStore.setToken(newToken),
        newRefreshToken && localStore.setRefreshToken(newRefreshToken),
      ]);

      processQueue(null, newToken);
      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      return axiosInstance(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError);
      toast.error("Session expired. Please log in again.");
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default axiosInstance;
