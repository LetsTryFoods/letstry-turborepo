import { createServerGraphQLClient } from '@/lib/graphql/server-client-factory';
import { GET_PRODUCTS_BY_CATEGORY } from '@/lib/queries/products';
import type { GetProductsByCategoryQuery } from '@/gql/graphql';

export async function getProductsByCategoryId(
  categoryId: string,
  limit: number = 20
): Promise<GetProductsByCategoryQuery['productsByCategory']['items']> {
  try {
    const client = createServerGraphQLClient();
    
    const data = await client.request<GetProductsByCategoryQuery>(
      GET_PRODUCTS_BY_CATEGORY.toString(),
      {
        categoryId,
        pagination: { page: 1, limit },
      }
    );

    return data.productsByCategory.items;
  } catch (error) {
    console.error(`Failed to fetch products for category ${categoryId}:`, error);
    return [];
  }
}
