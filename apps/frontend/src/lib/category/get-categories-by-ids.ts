import { createServerGraphQLClient } from '@/lib/graphql/server-client-factory';

interface CategoryInfo {
  id: string;
  name: string;
  slug: string;
  imageUrl?: string | null;
}

export async function getCategoriesByIds(
  categoryIds: string[]
): Promise<CategoryInfo[]> {
  if (!categoryIds || categoryIds.length === 0) {
    return [];
  }

  const client = createServerGraphQLClient();
  
  try {
    const categoryPromises = categoryIds.map((id) =>
      client.request<{ category: CategoryInfo }>(
        `query GetCategory($id: ID!) {
          category(id: $id) {
            id
            name
            slug
            imageUrl
          }
        }`,
        { id }
      ).catch((error) => {
        console.error(`Failed to fetch category ${id}:`, error);
        return { category: null };
      })
    );

    const results = await Promise.all(categoryPromises);
    
    return results
      .map((result) => result.category)
      .filter((category): category is CategoryInfo => category !== null && category !== undefined);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}
