import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import { ledgerApi } from "../services/ledgerApi";
import { deliveryApi } from "../services/deliveryApi";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [ledgerApi.reducerPath]: ledgerApi.reducer,
    [deliveryApi.reducerPath]: deliveryApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(ledgerApi.middleware)
      .concat(deliveryApi.middleware),
});
