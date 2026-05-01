import { GraphQLClient } from 'graphql-request';

const GRAPHQL_ENDPOINT = process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:5000/graphql';

export const createServerGraphQLClient = (headers?: HeadersInit, revalidate?: number): GraphQLClient => {
  return new GraphQLClient(GRAPHQL_ENDPOINT, {
    headers: headers || {},
    fetch: (url, options) =>
      revalidate !== undefined
        ? fetch(url, { ...options, next: { revalidate } } as RequestInit)
        : fetch(url, { ...options, cache: 'no-store' }),
  });
};
