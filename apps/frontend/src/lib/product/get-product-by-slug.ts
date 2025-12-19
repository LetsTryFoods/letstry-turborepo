import { createServerGraphQLClient } from '@/lib/graphql/server-client-factory';
import { GET_PRODUCT_BY_SLUG } from '@/lib/queries/products';
import type { GetProductBySlugQuery } from '@/gql/graphql';

export async function getProductBySlug(slug: string): Promise<GetProductBySlugQuery['productBySlug']> {
  const client = createServerGraphQLClient();
  
  const data = await client.request<GetProductBySlugQuery>(
    GET_PRODUCT_BY_SLUG.toString(),
    { slug }
  );

  return data.productBySlug;
}
