import {
  ApolloClient,
  InMemoryCache,
  createHttpLink,
  from,
  Observable,
} from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { onError } from "@apollo/client/link/error";
import { useAuthStore } from "../store/auth-store";
import AuthLogger from "./utils/auth-logger";

const GRAPHQL_URL =
  process.env.EXPO_PUBLIC_GRAPHQL_URL ||
  "https://apiv3.letstryfoods.com/graphql";

// Secret that identifies requests from the official mobile app.
// Stored in EXPO_PUBLIC_MOBILE_KEY env var — baked into the bundle at build time.
const MOBILE_KEY = process.env.EXPO_PUBLIC_MOBILE_KEY || "";

const httpLink = createHttpLink({ uri: GRAPHQL_URL });

const authLink = setContext(async (operation, { headers }) => {
  try {
    const state = useAuthStore.getState();
    const token = state.accessToken || "";
    const sessionId = state.sessionId || "";

    const finalAuthHeader = token
      ? `Bearer ${token}`
      : headers?.authorization || "";

    return {
      headers: {
        ...(headers || {}),
        authorization: finalAuthHeader,
        "x-session-id": sessionId || "",
        "x-mobile-key": MOBILE_KEY,
      },
    };
  } catch (error) {
    AuthLogger.error("Error reading auth state:", error);
    return { headers };
  }
});

const errorLink = onError(
  ({ graphQLErrors, networkError, operation, forward }) => {
    if (graphQLErrors) {
      let isUnauthenticated = false;

      graphQLErrors.forEach(({ message, path, extensions }) => {
        AuthLogger.warn(`GraphQL error: ${message} | Path: ${path}`);

        const isAuthError =
          extensions?.code === "UNAUTHENTICATED" ||
          message?.includes("Unauthorized") ||
          message?.includes("User identification required");

        if (isAuthError) {
          isUnauthenticated = true;
        }
      });

      if (isUnauthenticated && operation.operationName !== "CreateGuest") {
        AuthLogger.info(
          "Token expired/invalid. Re-initializing guest session...",
        );
        return new Observable((observer) => {
          (async () => {
            try {
              // 1. Get the auth store
              const { useAuthStore } = await import("../store/auth-store");

              // 2. Clear current expired session/user info
              await useAuthStore.getState().logout();

              // 3. Dynamically import GuestService to avoid circular dependency
              const { GuestService } =
                await import("../features/auth/services/guest.service");

              // 4. Create a new guest session
              await GuestService.createGuestSession();

              // 5. Get the newly created session id from the store
              const newSessionId = useAuthStore.getState().sessionId;

              // 6. Update the operation context with new headers
              const oldHeaders = operation.getContext().headers;
              operation.setContext({
                headers: {
                  ...oldHeaders,
                  authorization: "", // We logged out, so clear this
                  "x-session-id": newSessionId || "",
                },
              });

              // 7. Prevent infinite loops by not retrying operations that explicitly require a JWT
              const REQUIRES_JWT = [
                "GetMyOrders",
                "GetOrderById",
                "GetShipmentWithTracking",
              ];
              if (REQUIRES_JWT.includes(operation.operationName)) {
                AuthLogger.info(
                  `Not retrying ${operation.operationName} as it requires authentication.`,
                );
                observer.error(graphQLErrors);
                return;
              }

              // 8. Retry the request automatically (for dual-auth queries like GetCart)
              const subscriber = {
                next: observer.next.bind(observer),
                error: observer.error.bind(observer),
                complete: observer.complete.bind(observer),
              };

              forward(operation).subscribe(subscriber);
            } catch (err) {
              AuthLogger.error(
                "Failed to re-initialize guest session on expiry:",
                err,
              );
              observer.error(err);
            }
          })();
        });
      }
    }

    if (networkError) {
      AuthLogger.warn(`Network error: ${networkError}`);
    }
  },
);

export const client = new ApolloClient({
  link: from([authLink, errorLink, httpLink]),
  cache: new InMemoryCache(),
});
