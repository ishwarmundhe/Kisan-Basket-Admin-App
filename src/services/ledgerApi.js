// services/ledgerApi.js
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Define the base URL
const BASE_URL = 'https://api.kisanbasket.com/api/ledger';

export const ledgerApi = createApi({
  reducerPath: 'ledgerApi',
baseQuery: fetchBaseQuery({ 
    baseUrl: 'https://api.kisanbasket.com/api/ledger',
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth.token; 
      if (token) {
        headers.set('Authorization', `JWT ${token}`);
      }
      return headers;
    },
  }),
  
  tagTypes: ['Entries', 'EntryTypes', 'Categories', 'Summary'],
  endpoints: (builder) => ({
    getEntries: builder.query({
      query: (date) => `/entries/?date=${date}`,
      providesTags: ['Entries', 'Summary'],
    }),
    getEntryById: builder.query({
      query: (id) => `/entries/${id}/`,
      providesTags: (result, error, id) => [{ type: 'Entries', id }],
    }),
    createEntry: builder.mutation({
      query: (body) => ({
        url: '/entries/create/',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Entries', 'Summary'],
    }),
    updateEntry: builder.mutation({
      query: ({ id, ...patch }) => ({
        url: `/entries/${id}/update/`,
        method: 'PUT',
        body: patch,
      }),
      invalidatesTags: ['Entries', 'Summary'],
    }),
    deleteEntry: builder.mutation({
      query: (id) => ({
        url: `/entries/${id}/delete/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Entries', 'Summary'],
    }),

    // --- 2. Ledger Entry Types ---
    getEntryTypes: builder.query({
      query: () => '/types/',
      providesTags: ['EntryTypes'],
    }),
    getEntryTypeById: builder.query({
      query: (id) => `/types/${id}/`,
      providesTags: (result, error, id) => [{ type: 'EntryTypes', id }],
    }),
    searchEntryTypes: builder.query({
      query: (search) => `/entry-types/dropdown/?search=${search}`,
    }),
    createEntryType: builder.mutation({
      query: (body) => ({
        url: '/types/create/',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['EntryTypes'],
    }),
    updateEntryType: builder.mutation({
      query: ({ id, ...patch }) => ({
        url: `/types/${id}/update/`,
        method: 'PUT',
        body: patch,
      }),
      invalidatesTags: ['EntryTypes'],
    }),
    deleteEntryType: builder.mutation({
      query: (id) => ({
        url: `/types/${id}/delete/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['EntryTypes'],
    }),

    // --- 3. Ledger Categories ---
    getCategories: builder.query({
      query: () => '/categories/',
      providesTags: ['Categories'],
    }),
    getCategoryById: builder.query({
      query: (id) => `/categories/${id}/`,
      providesTags: (result, error, id) => [{ type: 'Categories', id }],
    }),
    searchCategories: builder.query({
      query: (search) => `/categories/dropdown/?search=${search}`,
    }),
    createCategory: builder.mutation({
      query: (body) => ({
        url: '/categories/create/',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Categories'],
    }),
    updateCategory: builder.mutation({
      query: ({ id, ...patch }) => ({
        url: `/categories/${id}/update/`,
        method: 'PUT',
        body: patch,
      }),
      invalidatesTags: ['Categories'],
    }),
    deleteCategory: builder.mutation({
      query: (id) => ({
        url: `/categories/${id}/delete/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Categories'],
    }),

    // --- 4. Reports ---
    getDailySummary: builder.query({
      query: (date) => `/entries/summary/?date=${date}`,
      providesTags: ['Summary'],
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