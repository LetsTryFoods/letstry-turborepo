'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { graphqlClient } from '@/lib/graphql/client-factory';
import { SEARCH_PRODUCTS } from './search-query';
import type { SearchProductsQuery, SearchProductsQueryVariables } from '@/gql/graphql';

const LIMIT = 50;

export function useSearchProducts(searchTerm: string, nameOnly: boolean = false) {
  const trimmedSearchTerm = searchTerm.trim();

  return useInfiniteQuery<SearchProductsQuery, Error>({
    queryKey: ['searchProducts', trimmedSearchTerm, nameOnly],
    queryFn: async ({ pageParam }) => {
      const vars: SearchProductsQueryVariables = {
        searchTerm: trimmedSearchTerm,
        pagination: { page: pageParam as number, limit: LIMIT },
        nameOnly,
      };
      return graphqlClient.request(SEARCH_PRODUCTS as any, vars);
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const meta = lastPage?.searchProducts?.meta;
      return meta?.hasNextPage ? meta.page + 1 : undefined;
    },
    staleTime: 0,
  });
}
