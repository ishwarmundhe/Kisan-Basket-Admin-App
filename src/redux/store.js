import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import { ledgerApi } from "../services/ledgerApi"; 

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [ledgerApi.reducerPath]: ledgerApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(ledgerApi.middleware),
});