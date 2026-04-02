import { useState, useEffect } from 'react';
import { useApolloClient, useQuery } from '@apollo/client';
import { GET_PRODUCT_BY_ID } from '../../../lib/graphql/product';
import { GET_PRODUCTS_BY_CATEGORY } from '../../../lib/graphql/home';

export const useCartRecommendations = (cartItems: any[]) => {
  const client = useApolloClient();
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!cartItems || cartItems.length === 0) {
      setRecommendations([]);
      return;
    }

    const fetchRecommendations = async () => {
      setLoading(true);
      try {
        // 1. Extract unique product IDs from cart
        const productIds = Array.from(new Set(cartItems.map((item: any) => item.productId)));

        // 2. Fetch full product details to get category IDs
        // We do this because the cart items don't include categories directly
        const productDetails = await Promise.all(
          productIds.map(async (id) => {
            const { data } = await client.query({
              query: GET_PRODUCT_BY_ID,
              variables: { id },
              fetchPolicy: 'cache-first', // Use cache if available
            });
            return data?.product;
          })
        );

        // 3. Extract unique category IDs
        const categoryIds = Array.from(
          new Set(
            productDetails
              .filter((p) => p && p.categoryIds)
              .flatMap((p) => p.categoryIds)
          )
        );

        if (categoryIds.length === 0) {
          setRecommendations([]);
          setLoading(false);
          return;
        }

        // 4. Fetch products for each category
        // To ensure variety, we fetch from all unique categories
        const categoryProductsResults = await Promise.all(
          categoryIds.slice(0, 3).map(async (catId) => {
            const { data } = await client.query({
              query: GET_PRODUCTS_BY_CATEGORY,
              variables: { 
                categoryId: catId, 
                pagination: { limit: 12, page: 1 } 
              },
              fetchPolicy: 'network-only',
            });
            return data?.productsByCategory?.items || [];
          })
        );

        // 5. Flatten and Filter
        let allProducts = categoryProductsResults.flat();
        
        // Exclude products already in cart
        const cartProductIds = new Set(productIds);
        const filteredProducts = allProducts.filter(
          (p: any) => !cartProductIds.has(p._id)
        );

        // 6. Unique Products (in case they appear in multiple categories)
        const uniqueProductsMap = new Map();
        filteredProducts.forEach((p: any) => {
          if (!uniqueProductsMap.has(p._id)) {
            uniqueProductsMap.set(p._id, p);
          }
        });
        const uniqueProducts = Array.from(uniqueProductsMap.values());

        // 7. Randomize and Limit to 8
        const shuffled = uniqueProducts.sort(() => 0.5 - Math.random());
        setRecommendations(shuffled.slice(0, 8));
      } catch (error) {
        console.error('Error fetching cart recommendations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [cartItems, client]);

  return { recommendations, loading };
};
