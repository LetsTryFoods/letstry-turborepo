import { useQuery } from '@apollo/client';
import { SEARCH_PRODUCTS } from '../../../lib/graphql/search';
import { SearchProduct } from '../types';

export function useSearchProducts(searchTerm: string, page = 1, limit = 20) {
  const { data, loading, error, refetch } = useQuery(SEARCH_PRODUCTS, {
    variables: {
      searchTerm,
      pagination: { page, limit },
      nameOnly: false,
    },
    fetchPolicy: 'cache-and-network',
  });

  const products: SearchProduct[] = data?.searchProducts?.items || [];
  const meta = data?.searchProducts?.meta || null;

  return {
    products,
    meta,
    loading,
    error,
    refetch,
  };
}
