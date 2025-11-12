import {
  ApolloClient,
  InMemoryCache,
  createHttpLink,
  from,
} from "@apollo/client";
import { onError } from "@apollo/client/link/error";
import { setContext } from "@apollo/client/link/context";
import { Observable } from "@apollo/client/utilities";
import { REFRESH_TOKEN_MUTATION } from "../graphql/Mutation";
import { localStore } from "../localStore/LocalStore";
import { GRAPHQL_BASE_URL, API_BASE_URL } from "@env";

import { toast } from "sonner-native";
import { logout } from "../constant/AuthService";

// HTTP Link Configuration
const httpLink = createHttpLink({
  uri: GRAPHQL_BASE_URL,
  credentials: "include",
});

// Base Client (without error handling) - DECLARE FIRST
export const bareClient = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: "network-only",
      errorPolicy: "ignore",
    },
    query: {
      fetchPolicy: "network-only",
      errorPolicy: "all",
    },
    mutate: {
      errorPolicy: "all",
    },
  },
});

// Auth Link for JWT Token
const authLink = setContext(async (_, { headers }) => {
  const token = await localStore.getToken();
  return {
    headers: {
      ...headers,
      Authorization: token ? `JWT ${token}` : "",
    },
  };
});

// Token Refresh Function - NOW CAN USE bareClient
async function refreshToken() {
  const refreshToken = await localStore.getRefreshToken(); // Fixed typo: getRefreshTokenn -> getRefreshToken
  if (!refreshToken) {
    toast.warning("No refresh token available");
    return null;
  }

  try {
    const result = await bareClient.mutate({
      mutation: REFRESH_TOKEN_MUTATION,
      variables: { refreshToken },
    });

    const token = result?.data?.tokenRefresh?.token;
    const refreshTokenNew = result?.data?.tokenRefresh?.refreshToken;

    if (token) {
      await Promise.all([
        localStore.setToken(token),
        refreshTokenNew && localStore.setRefreshToken(refreshTokenNew),
      ]);
      return token;
    }
    return null;
  } catch (error) {
    console.error("Token refresh failed:", error);
    return null;
  }
}

// Error Handling Link
const errorLink = onError(
  ({ graphQLErrors, networkError, operation, forward }) => {
    // Handle network errors
    if (networkError) {
      toast.error(`Network error: ${networkError.message}`);
      return;
    }

    if (graphQLErrors) {
      for (const err of graphQLErrors) {
        const message = err.message?.toLowerCase?.() || "";
        const errorCode = err.extensions?.code || "";

        // Skip if already retried
        if (operation.getContext().retry) {
          toast.error(`Authentication failed: ${message}`);
          logout();
          return;
        }

        // Conditions for token refresh
        const shouldRefresh = [
          // "signature has expired",
          // "permission",
          // "manage_orders",
          "invalid token",
        ].some((term) => message.includes(term.toLowerCase()));

        if (shouldRefresh) {
          return new Observable((observer) => {
            refreshToken()
              .then((newToken) => {
                if (!newToken) {
                  throw new Error("Refresh token failed");
                }

                // Retry with new token
                operation.setContext(({ headers = {} }) => ({
                  headers: {
                    ...headers,
                    Authorization: `JWT ${newToken}`,
                  },
                  retry: true,
                }));

                const subscriber = {
                  next: observer.next.bind(observer),
                  error: observer.error.bind(observer),
                  complete: observer.complete.bind(observer),
                };

                forward(operation).subscribe(subscriber);
              })
              .catch((error) => {
                toast.error("Session expired. Please login again.");
                logout();
                observer.error(error);
              });
          });
        }
      }
    }
  }
);

// Main Client with all links
export const client = new ApolloClient({
  link: from([authLink, errorLink, httpLink]), // Reordered for better flow
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: "cache-and-network",
      errorPolicy: "all",
    },
    query: {
      fetchPolicy: "network-only",
      errorPolicy: "all",
    },
    mutate: {
      errorPolicy: "all",
    },
  },
});
