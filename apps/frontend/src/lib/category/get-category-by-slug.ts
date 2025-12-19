import { createServerGraphQLClient } from '@/lib/graphql/server-client-factory';
import { GET_CATEGORY_BY_SLUG } from '@/lib/queries/categories';
import type { GetCategoryBySlugQuery } from '@/gql/graphql';

export async function getCategoryBySlug(slug: string): Promise<GetCategoryBySlugQuery['categoryBySlug']> {
  const client = createServerGraphQLClient();
  
  const data = await client.request<GetCategoryBySlugQuery>(
    GET_CATEGORY_BY_SLUG.toString(),
    {
      slug,
      includeArchived: false,
    }
  );

  return data.categoryBySlug;
}
