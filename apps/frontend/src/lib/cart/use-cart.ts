"use client";

import { useGraphQLQuery, defaultGraphQLQueryOptions } from '@/lib/graphql/use-graphql-query';
import { GET_MY_CART } from '@/lib/queries/cart';

export const useCart = () => {
  return useGraphQLQuery(
    ['cart'],
    GET_MY_CART.toString(),
    undefined,
    {
      ...defaultGraphQLQueryOptions,
      staleTime: 0,
      refetchOnWindowFocus: true,
    }
  );
};
