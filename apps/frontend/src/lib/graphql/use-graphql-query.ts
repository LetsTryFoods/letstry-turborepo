"use client";

import { useQuery, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import { graphqlClient } from './client-factory';
import type { TypedDocumentNode } from '@graphql-typed-document-node/core';

export function useGraphQLQuery<TResult, TVariables extends object = object>(
  queryKey: unknown[],
  document: TypedDocumentNode<TResult, TVariables> | string,
  variables?: TVariables,
  options?: Omit<UseQueryOptions<TResult, Error>, 'queryKey' | 'queryFn'>
): UseQueryResult<TResult, Error> {
  return useQuery<TResult, Error>({
    queryKey,
    queryFn: async () => {
      return await graphqlClient.request(document as any, variables);
    },
    ...options,
  });
}

export const DEFAULT_STALE_TIME = 5 * 60 * 1000;

export const defaultGraphQLQueryOptions = {
  staleTime: DEFAULT_STALE_TIME,
  refetchOnWindowFocus: false,
} as const;
