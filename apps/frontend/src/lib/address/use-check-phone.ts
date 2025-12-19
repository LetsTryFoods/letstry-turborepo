"use client";

import { useGraphQLQuery } from '@/lib/graphql/use-graphql-query';
import { CHECK_PHONE_EXISTS } from '@/lib/queries/address';

export const useCheckPhone = (phoneNumber: string, enabled: boolean = false) => {
  return useGraphQLQuery(
    ['checkPhone', phoneNumber],
    CHECK_PHONE_EXISTS.toString(),
    { phoneNumber },
    {
      enabled: enabled && phoneNumber.length >= 10,
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
    }
  );
};
