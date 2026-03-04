import {
  ApolloClient,
  InMemoryCache,
  HttpLink,
  ApolloLink,
  Observable,
} from "@apollo/client";
import { onError } from "@apollo/client/link/error";

import { store } from "../redux/store";
import { setToken, logout as logoutAction } from "../redux/slices/authSlice";
import { GRAPHQL_BASE_URL, API_BASE_URL } from "@env";
import localStore from "../utils/localStore";

const httpLink = new HttpLink({
  uri: GRAPHQL_BASE_URL,
});

const authLink = new ApolloLink((operation, forward) => {
  return new Observable((observer) => {
    let handle;

    Promise.resolve(localStore.getToken())
      .then((token) => {
        // Set the headers
        operation.setContext({
          headers: {
            ...operation.getContext().headers,
            authorization: token ? `JWT ${token}` : "",
          },
        });
      })
      .then(() => {
        // Forward the operation
        handle = forward(operation).subscribe({
          next: observer.next.bind(observer),
          error: observer.error.bind(observer),
          complete: observer.complete.bind(observer),
        });
      })
      .catch((error) => {
        // Handle errors in token retrieval
        observer.error(error);
      });

    // Cleanup function
    return () => {
      if (handle) handle.unsubscribe();
    };
  });
});

// --- REFRESH TOKEN LOGIC ---
let isRefreshing = false;
let pendingRequests = [];

const resolvePendingRequests = (token) => {
  pendingRequests.forEach((callback) => callback(token));
  pendingRequests = [];
};

const getNewToken = async () => {
  const refreshToken = await localStore.getRefreshToken();
  if (!refreshToken) return null;

  try {
    // Use standard fetch to avoid Apollo loops
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

    const { data } = await response.json();
    if (data?.tokenRefresh?.token) {
      return data.tokenRefresh.token;
    }
  } catch (error) {
    console.log("Refresh request failed", error);
  }
  return null;
};

// 3. Error Link (Handles 401/Expired)
const errorLink = onError(({ graphQLErrors, operation, forward }) => {
  if (graphQLErrors) {
    for (let err of graphQLErrors) {
      // CHECK YOUR SPECIFIC BACKEND ERROR MESSAGE
      const isTokenExpired =
        err.message.includes("Signature has expired") ||
        err.message.includes("JWTExpired");

      if (isTokenExpired) {
        let forward$;

        if (!isRefreshing) {
          isRefreshing = true;
          forward$ = new Observable((observer) => {
            getNewToken()
              .then(async (newToken) => {
                if (newToken) {
                  // 1. Update Storage & Redux
                  await localStore.setToken(newToken);
                  store.dispatch(setToken(newToken));

                  // 2. Resolve pending requests
                  resolvePendingRequests(newToken);

                  // 3. Retry THIS request
                  const oldHeaders = operation.getContext().headers;
                  operation.setContext({
                    headers: {
                      ...oldHeaders,
                      authorization: `JWT ${newToken}`,
                    },
                  });

                  const subscriber = {
                    next: observer.next.bind(observer),
                    error: observer.error.bind(observer),
                    complete: observer.complete.bind(observer),
                  };
                  forward(operation).subscribe(subscriber);
                } else {
                  // Refresh failed -> Logout
                  observer.error(err);
                  store.dispatch(logoutAction());
                  await localStore.clear();
                }
              })
              .catch((e) => {
                observer.error(e);
                store.dispatch(logoutAction());
              })
              .finally(() => {
                isRefreshing = false;
              });
          });
        } else {
          // Add to queue
          forward$ = new Observable((observer) => {
            pendingRequests.push((newToken) => {
              if (newToken) {
                const oldHeaders = operation.getContext().headers;
                operation.setContext({
                  headers: {
                    ...oldHeaders,
                    authorization: `JWT ${newToken}`,
                  },
                });
                const subscriber = {
                  next: observer.next.bind(observer),
                  error: observer.error.bind(observer),
                  complete: observer.complete.bind(observer),
                };
                forward(operation).subscribe(subscriber);
              } else {
                observer.error(err);
              }
            });
          });
        }
        return forward$;
      }
    }
  }
});

// 4. Export Client (Use 'ApolloLink.from' instead of 'from')
export const client = new ApolloClient({
  link: ApolloLink.from([errorLink, authLink, httpLink]),
  cache: new InMemoryCache(),
});
