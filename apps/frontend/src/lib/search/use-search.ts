'use client';

import { useGraphQLQuery, defaultGraphQLQueryOptions } from '@/lib/graphql/use-graphql-query';
import { SEARCH_PRODUCTS } from './search-query';
import type { SearchProductsQuery, SearchProductsQueryVariables } from '@/gql/graphql';

export function useSearchProducts(searchTerm: string, page: number = 1, limit: number = 50) {
  const trimmedSearchTerm = searchTerm.trim();
  
  return useGraphQLQuery<SearchProductsQuery, SearchProductsQueryVariables>(
    ['searchProducts', trimmedSearchTerm, page, limit],
    SEARCH_PRODUCTS.toString(),
    {
      searchTerm: trimmedSearchTerm || ' ',
      pagination: { page, limit },
    },
    {
      ...defaultGraphQLQueryOptions,
      enabled: true,
      staleTime: 0,
    }
  );
}
