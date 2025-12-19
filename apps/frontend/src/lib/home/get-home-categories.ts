import { createServerGraphQLClient } from '@/lib/graphql/server-client-factory';
import { GET_ROOT_CATEGORIES } from '@/lib/queries/categories';
import type { GetRootCategoriesQuery } from '@/gql/graphql';

export async function getHomeCategories(limit: number = 20): Promise<GetRootCategoriesQuery['rootCategories']> {
  const client = createServerGraphQLClient();
  
  const data = await client.request<GetRootCategoriesQuery>(
    GET_ROOT_CATEGORIES.toString(),
    {
      pagination: { limit, page: 1 },
      includeArchived: false,
    }
  );

  return data.rootCategories;
}
