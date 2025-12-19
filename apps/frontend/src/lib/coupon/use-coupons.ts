"use client";

import { useGraphQLQuery, defaultGraphQLQueryOptions } from '@/lib/graphql/use-graphql-query';
import { GET_ACTIVE_COUPONS } from '@/lib/queries/coupon';

export const useCoupons = () => {
  return useGraphQLQuery(
    ['coupons'],
    GET_ACTIVE_COUPONS.toString(),
    undefined,
    {
      ...defaultGraphQLQueryOptions,
      staleTime: 0,
    }
  );
};
