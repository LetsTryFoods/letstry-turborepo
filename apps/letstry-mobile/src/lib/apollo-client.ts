import { ApolloClient, InMemoryCache, createHttpLink, from, ApolloLink, Observable } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { useAuthStore } from '../store/auth-store';

const GRAPHQL_URL =
  process.env.EXPO_PUBLIC_GRAPHQL_URL || 'https://apiv3.letstryfoods.com/graphql';

const httpLink = createHttpLink({ uri: GRAPHQL_URL });

const authLink = setContext(async (operation, { headers }) => {
  try {
    const state = useAuthStore.getState();
    const token = state.accessToken || '';
    const sessionId = state.sessionId || '';

    const finalAuthHeader = token ? `Bearer ${token}` : (headers?.authorization || '');

    if (operation.operationName === 'Me') {
      console.log('[Apollo Debug] Me Query - Raw Token:', token);
      console.log('[Apollo Debug] Me Query - Full Auth Header:', finalAuthHeader);
      console.log('[Apollo Debug] Me Query - Session ID:', sessionId || 'MISSING');
      console.log('[Apollo Debug] Me Query - All Headers:', {
        authorization: finalAuthHeader,
        'x-session-id': sessionId || '',
      });
    }

    return {
      headers: {
        ...(headers || {}),
        authorization: finalAuthHeader,
        'x-session-id': sessionId || '',
      },
    };
  } catch (error) {
    console.error('[Apollo] Error reading auth state:', error);
    return { headers };
  }
});

const errorLink = onError(({ graphQLErrors, networkError, operation, forward }) => {
  if (graphQLErrors) {
    let isUnauthenticated = false;

    graphQLErrors.forEach(({ message, path, extensions }) => {
      console.warn(`[GraphQL error]: ${message} | Path: ${path}`);
      
      const isAuthError = 
        extensions?.code === 'UNAUTHENTICATED' || 
        message?.includes('Unauthorized') ||
        message?.includes('User identification required');
        
      if (isAuthError) {
        isUnauthenticated = true;
      }
    });

    if (isUnauthenticated && operation.operationName !== 'CreateGuest') {
      console.log('[Apollo] Token expired/invalid. Re-initializing guest session...');
      return new Observable((observer) => {
        (async () => {
          try {
            // 1. Get the auth store
            const { useAuthStore } = await import('../store/auth-store');
            
            // 2. Clear current expired session/user info
            await useAuthStore.getState().logout();
            
            // 3. Dynamically import GuestService to avoid circular dependency
            const { GuestService } = await import('../features/auth/services/guest.service');
            
            // 4. Create a new guest session
            await GuestService.createGuestSession();
            
            // 5. Get the newly created session id from the store
            const newSessionId = useAuthStore.getState().sessionId;
            
            // 6. Update the operation context with new headers
            const oldHeaders = operation.getContext().headers;
            operation.setContext({
              headers: {
                ...oldHeaders,
                authorization: '', // We logged out, so clear this
                'x-session-id': newSessionId || '',
              },
            });
            
            // 7. Retry the request automatically
            const subscriber = {
              next: observer.next.bind(observer),
              error: observer.error.bind(observer),
              complete: observer.complete.bind(observer),
            };
            
            forward(operation).subscribe(subscriber);
            
          } catch (err) {
            console.error('[Apollo] Failed to re-initialize guest session on expiry:', err);
            observer.error(err);
          }
        })();
      });
    }
  }

  if (networkError) {
    console.warn(`[Network error]: ${networkError}`);
  }
});

const loggerLink = new ApolloLink((operation, forward) => {
  const context = operation.getContext();
  console.log(`[GraphQL Request]: ${operation.operationName}`, operation.variables);
  if (operation.operationName === 'Me') {
    console.log('[GraphQL Request Headers for Me]:', context.headers);
  }
  return forward(operation).map((response) => {
    console.log(`[GraphQL Response]: ${operation.operationName}`, response.data);
    return response;
  });
});

export const client = new ApolloClient({
  link: from([authLink, loggerLink, errorLink, httpLink]),
  cache: new InMemoryCache(),
});
