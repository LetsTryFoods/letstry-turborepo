import { ApolloClient, InMemoryCache, createHttpLink, from } from '@apollo/client'
import { setContext } from '@apollo/client/link/context'
import { ErrorLink } from '@apollo/client/link/error'
import { CombinedGraphQLErrors } from '@apollo/client/errors'
import { getValidToken, redirectToLogin } from '@/lib/auth/token-service'

const httpLink = createHttpLink({
  uri: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/graphql',
  credentials: 'include',
})

const authLink = setContext((_, { headers }) => {
  const token = getValidToken()

  return {
    headers: {
      ...(headers || {}),
      authorization: token ? `Bearer ${token}` : '',
    },
  }
})

const errorLink = new ErrorLink(({ error }) => {
  if (CombinedGraphQLErrors.is(error)) {
    for (const err of error.errors) {
      if (err.extensions?.code === 'UNAUTHENTICATED' || 
          err.message.includes('Unauthorized') ||
          err.message.includes('Invalid token')) {
        redirectToLogin()
        return
      }
    }
  } else if (error.message) {
    if (error.message.includes('401') || error.message.includes('403')) {
      redirectToLogin()
    }
  }
})

export const client = new ApolloClient({
  link: from([errorLink, authLink, httpLink]),
  cache: new InMemoryCache(),
})