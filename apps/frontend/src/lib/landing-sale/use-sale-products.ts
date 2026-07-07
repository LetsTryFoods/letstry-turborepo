"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { graphqlClient } from "@/lib/graphql/client-factory";
import { SALE_PRODUCTS_PAGINATED } from "./sale-products-query";
import type {
  SaleProductsPaginatedQuery,
  SaleProductsPaginatedQueryVariables,
} from "@/gql/graphql";

const LIMIT = 24;

export function useSaleProducts() {
  return useInfiniteQuery<SaleProductsPaginatedQuery, Error>({
    queryKey: ["saleProductsPaginated"],
    queryFn: async ({ pageParam }) => {
      const vars: SaleProductsPaginatedQueryVariables = {
        pagination: { page: pageParam as number, limit: LIMIT },
      };
      return graphqlClient.request(SALE_PRODUCTS_PAGINATED as any, vars);
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const meta = lastPage?.saleProductsPaginated?.meta;
      return meta?.hasNextPage ? meta.page + 1 : undefined;
    },
    staleTime: 0,
  });
}
