'use client';

import { useGraphQLQuery } from '@/lib/graphql/use-graphql-query';
import { SEARCH_PRODUCTS } from './search-query';
import type { SearchProductsQuery, SearchProductsQueryVariables } from '@/gql/graphql';

export function useSearchProducts(
  searchTerm: string,
  page: number = 1,
  limit: number = 50,
  nameOnly: boolean = false
) {
  const trimmedSearchTerm = searchTerm.trim();

  const result = useGraphQLQuery<SearchProductsQuery, SearchProductsQueryVariables>(
    ['searchProducts', page, limit, nameOnly],
    SEARCH_PRODUCTS.toString(),
    {
      searchTerm: trimmedSearchTerm,
      pagination: { page, limit },
      nameOnly,
    },
    {
      enabled: true,
      staleTime: 0,
    }
  );

  return result;
}
