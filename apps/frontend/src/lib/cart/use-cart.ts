"use client";

import { useGraphQLQuery, defaultGraphQLQueryOptions } from '@/lib/graphql/use-graphql-query';
import { GET_MY_CART } from '@/lib/queries/cart';
import type { GetMyCartQuery } from '@/gql/graphql';

export const useCart = () => {
  return useGraphQLQuery<GetMyCartQuery>(
    ['cart'],
    (GET_MY_CART as unknown as { value: string }).value,
    undefined,
    {
      ...defaultGraphQLQueryOptions,
      staleTime: 0,
      refetchOnWindowFocus: true,
    }
  );
};
