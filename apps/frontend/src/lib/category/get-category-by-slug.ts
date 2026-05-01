import { createServerGraphQLClient } from '@/lib/graphql/server-client-factory';
import { GET_CATEGORY_BY_SLUG } from '@/lib/queries/categories';
import type { GetCategoryBySlugQuery } from '@/gql/graphql';

export async function getCategoryBySlug(slug: string): Promise<GetCategoryBySlugQuery['categoryBySlug']> {
  const client = createServerGraphQLClient();

  const data = await client.request<GetCategoryBySlugQuery>(
    GET_CATEGORY_BY_SLUG as any,
    {
      slug,
      includeArchived: false,
    }
  );

  const category = data.categoryBySlug;

  // Defensive: the backend `categoryBySlug` resolver falls back to non-exact matches,
  // which would turn every bogus slug (e.g. /gfdg) into a soft 200 with the wrong
  // category — a serious SEO problem (infinite near-duplicate pages). Require an
  // exact, case-insensitive slug match before returning.
  if (category && category.slug?.toLowerCase() !== slug.toLowerCase()) {
    return null;
  }

  return category;
}
