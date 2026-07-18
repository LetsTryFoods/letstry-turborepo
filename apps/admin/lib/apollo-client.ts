import {
  ApolloClient,
  InMemoryCache,
  createHttpLink,
  from,
  Observable,
} from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { ErrorLink } from "@apollo/client/link/error";
import { removeTypenameFromVariables } from "@apollo/client/link/remove-typename";
import { CombinedGraphQLErrors } from "@apollo/client/errors";
import { getValidToken, redirectToLogin, setAuthToken } from "@/lib/auth/token-service";

const httpLink = createHttpLink({
  uri: process.env.NEXT_PUBLIC_GRAPHQL_URL || "http://localhost:5000/graphql",
  credentials: "include",
});

// Apollo cache adds `__typename` to every fetched object. When the admin
// edits an existing CMS entity (Pillar, Author, Press Mention, etc.), the
// form re-uses the cached object as state and sends it back via Update
// mutations — which fail because the GraphQL Input types don't define
// `__typename`. The error surfaces as a save-failure toast like:
//   `Field "__typename" is not defined by type "PillarCategoryTileInput"`
//
// Stripping `__typename` from variables on outgoing operations fixes this
// globally for every admin mutation. Per-form `stripServerFields()` helpers
// only handled the top-level object, not nested arrays of objects, so they
// missed `categoryTiles[*].__typename`, `faqs[*].__typename`, etc.
const removeTypenameLink = removeTypenameFromVariables();

const authLink = setContext((_, { headers }) => {
  const token = getValidToken();

  return {
    headers: {
      ...(headers || {}),
      authorization: token ? `Bearer ${token}` : "",
    },
  };
});

let isRefreshing = false;
let pendingRequests: (() => void)[] = [];

const resolvePendingRequests = () => {
  pendingRequests.forEach((resolve) => resolve());
  pendingRequests = [];
};

const errorLink = new ErrorLink(({ error, operation, forward }) => {
  if (CombinedGraphQLErrors.is(error)) {
    for (const err of error.errors) {
      if (
        err.extensions?.code === "UNAUTHENTICATED" ||
        err.message.includes("Unauthorized") ||
        err.message.includes("Invalid token")
      ) {
        // If the refresh token mutation itself fails, log out to prevent infinite loops
        if (operation.operationName === "AdminRefreshToken") {
          redirectToLogin();
          return;
        }

        if (!isRefreshing) {
          isRefreshing = true;

          const graphqlUrl =
            process.env.NEXT_PUBLIC_GRAPHQL_URL ||
            (process.env.NEXT_PUBLIC_API_BASE_URL
              ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/graphql`
              : "http://localhost:5000/graphql");

          // We call the GraphQL endpoint manually instead of using the apollo client
          // so we don't trigger this interceptor again recursively
          fetch(graphqlUrl, {
            method: "POST",
            credentials: "include", // Ensures the httpOnly admin_refresh_token cookie is sent
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              query: `mutation AdminRefreshToken { adminRefreshToken }`,
            }),
          })
            .then((res) => res.json())
            .then((json) => {
              const newToken = json?.data?.adminRefreshToken;
              if (newToken) {
                setAuthToken(newToken);
                resolvePendingRequests();
              } else {
                pendingRequests = [];
                redirectToLogin();
              }
            })
            .catch(() => {
              pendingRequests = [];
              redirectToLogin();
            })
            .finally(() => {
              isRefreshing = false;
            });
        }

        // Return an Observable that queues this request and retries when resolved
        return new Observable((observer) => {
          pendingRequests.push(() => {
            // Update headers with new token
            const token = getValidToken();
            const oldHeaders = operation.getContext().headers;
            operation.setContext({
              headers: {
                ...oldHeaders,
                authorization: token ? `Bearer ${token}` : "",
              },
            });

            // Retry the request
            forward(operation).subscribe({
              next: observer.next.bind(observer),
              error: observer.error.bind(observer),
              complete: observer.complete.bind(observer),
            });
          });
        });
      }
    }
  } else if (error && error.message) {
    if (
      error.message.includes("401") ||
      error.message.includes("403")
    ) {
      redirectToLogin();
    }
  }
});

export const client = new ApolloClient({
  link: from([errorLink, removeTypenameLink, authLink, httpLink]),
  cache: new InMemoryCache(),
});
