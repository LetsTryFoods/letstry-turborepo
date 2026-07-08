"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { graphqlClient } from "@/lib/graphql/client-factory";
import { SALE_PRODUCTS_PAGINATED } from "./sale-products-query";
import type {
  SaleProductsPaginatedQuery,
  SaleProductsPaginatedQueryVariables,
} from "@/gql/graphql";
import type { SaleProductItem, SaleProductsMeta } from "./get-sale-data";

const LIMIT = 24;

interface UseSaleProductsOptions {
  /** Pre-fetched page 1 data from the server — used as initial cache so there's no loading state */
  initialItems?: SaleProductItem[];
  initialMeta?: SaleProductsMeta;
}

export function useSaleProducts({ initialItems, initialMeta }: UseSaleProductsOptions = {}) {
  const hasInitialData = !!initialItems && initialItems.length > 0;

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
    // If the server pre-fetched page 1, seed the cache so the client never
    // shows a loading spinner on first paint.
    initialData: hasInitialData
      ? {
          pages: [
            {
              saleProductsPaginated: {
                items: initialItems as any,
                meta: initialMeta as any,
              },
            },
          ],
          pageParams: [1],
        }
      : undefined,
    // Keep server data fresh for 10 minutes — matches page ISR interval
    staleTime: 600_000,
  });
}
