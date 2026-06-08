import { createServerGraphQLClient } from "@/lib/graphql/server-client-factory";
import { GET_CATEGORY_BY_SLUG } from "@/lib/queries/categories";
import type { GetCategoryBySlugQuery } from "@/gql/graphql";

/**
 * Fetch a category by slug.
 *
 * Wrapped in try/catch so a backend GraphQL error renders the proper 404
 * page (via notFound()) instead of cascading into the App Router error
 * boundary's "Something Went Wrong" screen. Mirrors the resilience pattern
 * already in place for getProductBySlug, getPillarBySlug, getAuthorBySlug.
 */
export async function getCategoryBySlug(
  slug: string,
): Promise<GetCategoryBySlugQuery["categoryBySlug"]> {
  const client = createServerGraphQLClient();

  let data: GetCategoryBySlugQuery | null = null;
  try {
    data = await client.request<GetCategoryBySlugQuery>(
      GET_CATEGORY_BY_SLUG as any,
      {
        slug,
        includeArchived: false,
      },
    );
  } catch (err) {
    console.error("[getCategoryBySlug] GraphQL request failed", {
      slug,
      error: err instanceof Error ? err.message : err,
    });
    return null;
  }

  const category = data?.categoryBySlug;

  // Defensive: the backend `categoryBySlug` resolver falls back to non-exact matches,
  // which would turn every bogus slug (e.g. /gfdg) into a soft 200 with the wrong
  // category — a serious SEO problem (infinite near-duplicate pages). Require an
  // exact, case-insensitive slug match before returning.
  if (category && category.slug?.toLowerCase() !== slug.toLowerCase()) {
    return null;
  }

  return category ?? null;
}
