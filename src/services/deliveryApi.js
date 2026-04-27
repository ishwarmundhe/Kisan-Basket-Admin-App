import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { URL } from "@env";

import { localStore } from "../utils/localStore";

const baseQueryWithAsyncToken = async (args, api, extraOptions) => {
  const token = await localStore.getToken();
  const rawBaseQuery = fetchBaseQuery({
    baseUrl: URL,
    prepareHeaders: (headers) => {
      if (token) {
        headers.set("Authorization", `JWT ${token}`);
      }
      return headers;
    },
  });
  const result = await rawBaseQuery(args, api, extraOptions);

  if (result.error) {
    const endpoint = typeof args === "string" ? args : args.url;
    console.error("API Error:", {
      url: `${URL}${endpoint}`,
      status: result.error.status,
      data: result.error.data,
    });
  }

  return result;
};

export const deliveryApi = createApi({
  reducerPath: "deliveryApi",
  baseQuery: baseQueryWithAsyncToken,

  tagTypes: ["Riders", "COD", "Orders", "AI"],

  endpoints: (builder) => ({
    // rider list
    getRidersList: builder.query({
      query: () => `/api/delivery/staff/riders/`,
      providesTags: ["Riders"],
    }),

    getPendingRidersList: builder.query({
      query: () => `/api/delivery/staff/riders/?approval_status=pending`,
      providesTags: ["Riders"],
    }),

    searchRider: builder.query({
      query: (param) => `/api/delivery/staff/riders/?q=${param}`,
    }),

    approveRider: builder.mutation({
      query: ({ rider_id, body }) => ({
        url: `/api/delivery/staff/riders/${rider_id}/approve/`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Riders"],
    }),

    rejectRider: builder.mutation({
      query: ({ rider_id }) => ({
        url: `/api/delivery/staff/riders/${rider_id}/reject/`,
        method: "POST",
      }),
      invalidatesTags: ["Riders"],
    }),

    // ORDERS

    orderList: builder.query({
      query: ({ date, q = "", page = 1, pageSize = 50 }) =>
        `/api/delivery/staff/orders/?delivery_date=${date}&q=${encodeURIComponent(q)}&page=${page}&page_size=${pageSize}`,
      providesTags: ["Orders"],
    }),

    assignSingleOrder: builder.mutation({
      query: (body) => ({
        url: `/api/delivery/staff/assign/`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Orders"],
    }),

    updateSingleOrderAssignment: builder.mutation({
      query: ({ body, orderId }) => ({
        url: `/api/delivery/staff/assign/${orderId}/`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Orders"],
    }),

    assignBulkOrder: builder.mutation({
      query: (body) => ({
        url: `/api/delivery/staff/bulk-assign/`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Orders"],
    }),

    // COD
    allCODCollection: builder.query({
      query: (params) => ({
        url: `/api/delivery/staff/cod/`,
        params,
      }),
      providesTags: ["COD"],
    }),

    pendingDeposit: builder.query({
      query: (params) => ({
        url: `/api/delivery/staff/cod/?status=collected`,
        params,
      }),
      providesTags: ["COD"],
    }),

    viewDepositDetails: builder.query({
      query: (params) => ({
        url: `/api/delivery/staff/cod/?status=deposited`,
        params,
      }),
      providesTags: ["COD"],
    }),

    filterCODRiders: builder.query({
      query: ({ rider_id, ...rest }) => ({
        url: `/api/delivery/staff/cod/?rider_id=${rider_id}`,
        params: rest,
      }),
      providesTags: ["COD"],
    }),

    codDeposit: builder.mutation({
      query: ({ orderId, body }) => ({
        url: `/api/delivery/staff/cod/${orderId}/verify/`,
        //url: `/api/delivery/orders/${orderId}/cod-deposited/`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["COD"],
    }),

    verifyCODDeposit: builder.mutation({
      query: ({ orderId, body }) => ({
        url: `/api/delivery/staff/cod/${orderId}/verify/`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["COD"],
    }),

    //

    registerDeliverPerson: builder.mutation({
      query: ({ body }) => ({
        url: `/api/delivery/staff/register/`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Orders"],
    }),

    aiOrderPrompt: builder.mutation({
      query: ({ body }) => ({
        url: `/api/order-parser/parse/`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["AI"],
    }),
  }),
});

export const {
  useAiOrderPromptMutation,
  useRegisterDeliverPersonMutation,
  useGetRidersListQuery,
  useGetPendingRidersListQuery,
  useSearchRiderQuery,
  useApproveRiderMutation,
  useRejectRiderMutation,

  useAssignSingleOrderMutation,
  useUpdateSingleOrderAssignmentMutation,
  useAssignBulkOrderMutation,

  useOrderListQuery,
  useCodDepositMutation,
  useAllCODCollectionQuery,
  usePendingDepositQuery,
  useViewDepositDetailsQuery,
  useFilterCODRidersQuery,
  useVerifyCODDepositMutation,
} = deliveryApi;
