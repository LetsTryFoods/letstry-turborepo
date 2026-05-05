import { ApolloClient, InMemoryCache, createHttpLink, from } from '@apollo/client'
import { setContext } from '@apollo/client/link/context'
import { ErrorLink } from '@apollo/client/link/error'
import { removeTypenameFromVariables } from '@apollo/client/link/remove-typename'
import { CombinedGraphQLErrors } from '@apollo/client/errors'
import { getValidToken, redirectToLogin } from '@/lib/auth/token-service'

const httpLink = createHttpLink({
  uri: process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:5000/graphql',
  credentials: 'include',
})

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
const removeTypenameLink = removeTypenameFromVariables()

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
  link: from([errorLink, removeTypenameLink, authLink, httpLink]),
  cache: new InMemoryCache(),
})