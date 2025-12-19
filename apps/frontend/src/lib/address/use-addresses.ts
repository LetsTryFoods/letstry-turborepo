"use client";

import { useGraphQLQuery, defaultGraphQLQueryOptions } from '@/lib/graphql/use-graphql-query';
import { GET_MY_ADDRESSES } from '@/lib/queries/address';

export const useAddresses = () => {
  return useGraphQLQuery(
    ['addresses'],
    GET_MY_ADDRESSES.toString(),
    undefined,
    defaultGraphQLQueryOptions
  );
};
