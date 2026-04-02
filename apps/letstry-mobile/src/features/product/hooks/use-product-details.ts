import { useQuery } from '@apollo/client';
import { useState, useEffect } from 'react';
import { GET_PRODUCT_DETAILS, GET_PRODUCT_BY_ID } from '../../../lib/graphql/product';
import { ProductDetails, ProductVariant } from '../types';

export function useProductDetails(idOrSlug: string, isId = false) {
  const query = isId ? GET_PRODUCT_BY_ID : GET_PRODUCT_DETAILS;
  const variables = isId ? { id: idOrSlug } : { slug: idOrSlug };

  const { data, loading, error, refetch } = useQuery(query, {
    variables,
    fetchPolicy: 'cache-and-network',
  });

  const product: ProductDetails | null = isId ? data?.product : data?.productBySlug;
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);

  useEffect(() => {
    if (product && (!selectedVariant || !product.variants.some(v => v._id === selectedVariant._id))) {
      const defaultV = product.variants.find((v) => v.isDefault) || product.variants[0];
      setSelectedVariant(defaultV);
    }
  }, [product]);

  // Consider it loading if we have product data but haven't initialized the variant yet
  const isActuallyLoading = loading || (product && !selectedVariant);

  return {
    product,
    selectedVariant,
    setSelectedVariant,
    loading: isActuallyLoading,
    error,
    refetch,
  };
}
