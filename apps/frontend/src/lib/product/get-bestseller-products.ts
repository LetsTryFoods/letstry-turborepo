import { createServerGraphQLClient } from '@/lib/graphql/server-client-factory';
import { GET_PRODUCTS_BY_CATEGORY } from '@/lib/queries/products';
import type { GetProductsByCategoryQuery } from '@/gql/graphql';

export async function getBestsellerProducts(
  categorySlug: string = 'best-selling',
  limit: number = 20
): Promise<GetProductsByCategoryQuery['productsByCategory']['items']> {
  const client = createServerGraphQLClient();

  const categoryQuery = await client.request<any>(
    `query GetCategoryBySlug($slug: String!) {
      categoryBySlug(slug: $slug) {
        id
      }
    }`,
    { slug: categorySlug }
  );

  const categoryId = categoryQuery?.categoryBySlug?.id;

  if (!categoryId) {
    return [];
  }

  const data = await client.request<GetProductsByCategoryQuery>(
    GET_PRODUCTS_BY_CATEGORY.toString(),
    {
      categoryId,
      pagination: { page: 1, limit },
    }
  );

  return data.productsByCategory.items;
}
