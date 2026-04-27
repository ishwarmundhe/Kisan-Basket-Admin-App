import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {
  setToken as setAuthToken,
  logout as logoutAuth,
} from "../redux/slices/authSlice";
import { localStore } from "../utils/localStore";
import { GRAPHQL_BASE_URL, GRAPHQL_BASE_URL_LEDGE } from "@env";

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

const baseQuery = fetchBaseQuery({
  baseUrl: GRAPHQL_BASE_URL_LEDGE,
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.token;
    if (token) {
      headers.set("Authorization", `JWT ${token}`);
    }
    return headers;
  },
});

const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    if (isRefreshing) {
      try {
        await new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        });
        result = await baseQuery(args, api, extraOptions);
      } catch (err) {
        return err;
      }
    } else {
      isRefreshing = true;

      try {
        const refreshToken = await localStore.getRefreshToken();

        if (!refreshToken) throw new Error("No refresh token");

        const response = await fetch(GRAPHQL_BASE_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: `
              mutation refreshToken($refreshToken: String!) {
                tokenRefresh(refreshToken: $refreshToken) {
                  token
                  errors { message }
                }
              }
            `,
            variables: { refreshToken },
          }),
        });

        const jsonResponse = await response.json();
        const newToken = jsonResponse?.data?.tokenRefresh?.token;

        if (newToken) {
          await localStore.setToken(newToken);
          api.dispatch(setAuthToken(newToken));

          processQueue(null, newToken);
          result = await baseQuery(args, api, extraOptions);
        } else {
          throw new Error("Refresh failed");
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        await localStore.clear();
        api.dispatch(logoutAuth());
      } finally {
        isRefreshing = false;
      }
    }
  }
  return result;
};

export const ledgerApi = createApi({
  reducerPath: "ledgerApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Entries", "EntryTypes", "Categories", "Summary"],
  endpoints: (builder) => ({
    getEntries: builder.query({
      query: (date) => `/entries/?date=${date}`,
      providesTags: ["Entries", "Summary"],
    }),
    getEntryById: builder.query({
      query: (id) => `/entries/${id}/`,
      providesTags: (result, error, id) => [{ type: "Entries", id }],
    }),
    createEntry: builder.mutation({
      query: (body) => ({
        url: "/entries/create/",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Entries", "Summary"],
    }),
    updateEntry: builder.mutation({
      query: ({ id, ...patch }) => ({
        url: `/entries/${id}/update/`,
        method: "PUT",
        body: patch,
      }),
      invalidatesTags: ["Entries", "Summary"],
    }),
    deleteEntry: builder.mutation({
      query: (id) => ({
        url: `/entries/${id}/delete/`,
        method: "DELETE",
      }),
      invalidatesTags: ["Entries", "Summary"],
    }),

    // --- 2. Ledger Entry Types ---
    getEntryTypes: builder.query({
      query: () => "/types/",
      providesTags: ["EntryTypes"],
    }),
    getEntryTypeById: builder.query({
      query: (id) => `/types/${id}/`,
      providesTags: (result, error, id) => [{ type: "EntryTypes", id }],
    }),
    searchEntryTypes: builder.query({
      query: (search) => `/entry-types/dropdown/?search=${search}`,
    }),
    createEntryType: builder.mutation({
      query: (body) => ({
        url: "/types/create/",
        method: "POST",
        body,
      }),
      invalidatesTags: ["EntryTypes"],
    }),
    updateEntryType: builder.mutation({
      query: ({ id, ...patch }) => ({
        url: `/types/${id}/update/`,
        method: "PUT",
        body: patch,
      }),
      invalidatesTags: ["EntryTypes"],
    }),
    deleteEntryType: builder.mutation({
      query: (id) => ({
        url: `/types/${id}/delete/`,
        method: "DELETE",
      }),
      invalidatesTags: ["EntryTypes"],
    }),

    // --- 3. Ledger Categories ---
    getCategories: builder.query({
      query: () => "/categories/",
      providesTags: ["Categories"],
    }),
    getCategoryById: builder.query({
      query: (id) => `/categories/${id}/`,
      providesTags: (result, error, id) => [{ type: "Categories", id }],
    }),
    searchCategories: builder.query({
      query: (search) => `/categories/dropdown/?search=${search}`,
    }),
    createCategory: builder.mutation({
      query: (body) => ({
        url: "/categories/create/",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Categories"],
    }),
    updateCategory: builder.mutation({
      query: ({ id, ...patch }) => ({
        url: `/categories/${id}/update/`,
        method: "PUT",
        body: patch,
      }),
      invalidatesTags: ["Categories"],
    }),
    deleteCategory: builder.mutation({
      query: (id) => ({
        url: `/categories/${id}/delete/`,
        method: "DELETE",
      }),
      invalidatesTags: ["Categories"],
    }),

    // --- 4. Reports ---
    getDailySummary: builder.query({
      query: (date) => `/entries/summary/?date=${date}`,
      providesTags: ["Summary"],
    }),
  }),
});

// Export hooks for usage in functional components
export const {
  // Entries
  useGetEntriesQuery,
  useGetEntryByIdQuery,
  useCreateEntryMutation,
  useUpdateEntryMutation,
  useDeleteEntryMutation,

  // Entry Types
  useGetEntryTypesQuery,
  useGetEntryTypeByIdQuery,
  useSearchEntryTypesQuery,
  useCreateEntryTypeMutation,
  useUpdateEntryTypeMutation,
  useDeleteEntryTypeMutation,

  // Categories
  useGetCategoriesQuery,
  useGetCategoryByIdQuery,
  useSearchCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,

  // Summary
  useGetDailySummaryQuery,
} = ledgerApi;
