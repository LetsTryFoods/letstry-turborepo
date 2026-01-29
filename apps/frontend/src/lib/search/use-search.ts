'use client';

import { useGraphQLQuery } from '@/lib/graphql/use-graphql-query';
import { SEARCH_PRODUCTS } from './search-query';
import type { SearchProductsQuery, SearchProductsQueryVariables } from '@/gql/graphql';

export function useSearchProducts(searchTerm: string, page: number = 1, limit: number = 50) {
  const trimmedSearchTerm = searchTerm.trim();

  const result = useGraphQLQuery<SearchProductsQuery, SearchProductsQueryVariables>(
    ['searchProducts', page, limit],
    SEARCH_PRODUCTS.toString(),
    {
      searchTerm: trimmedSearchTerm,
      pagination: { page, limit },
    },
    {
      enabled: true,
      staleTime: 0,
    }
  );

  return result;
}
