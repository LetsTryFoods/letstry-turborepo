import { createServerGraphQLClient } from '@/lib/graphql/server-client-factory';
import { GET_PRODUCT_BY_SLUG } from '@/lib/queries/products';
import { GET_PRODUCT_BY_SLUG_MINIMAL } from '@/lib/queries/products-minimal';
import type { GetProductBySlugQuery } from '@/gql/graphql';

/**
 * Sprint 4 hotfix — resilient product fetch with two-tier fallback.
 *
 * Why: the Sprint 4 rich GraphQL query asks for ~25 new fields
 * (longDescription, nutrition, productFaqs, pillarSlugs, etc.) that only
 * exist when the backend has been redeployed with the matching PR 2
 * schema changes. If the storefront and backend deploy out of order, or
 * the backend hits a transient GraphQL error, the rich query throws and
 * `error.tsx` shows "Something went wrong" on every product page —
 * exactly the symptom that triggered this hotfix.
 *
 * Order of attempts:
 *  1. Full Sprint 4 query (rich content)
 *  2. Minimal query (basic product fields only — no Sprint 4 additions)
 *  3. Return null → caller handles via notFound() (clean 404, not 500)
 *
 * The rich-content sections on the PDP all hide gracefully when their
 * fields are undefined, so falling back to the minimal query renders a
 * fully-functional Sprint-3-equivalent product page.
 */
export async function getProductBySlug(
  slug: string,
): Promise<GetProductBySlugQuery['productBySlug'] | null> {
  const client = createServerGraphQLClient();

  // Tier 1: full Sprint 4 query.
  try {
    const data = await client.request<GetProductBySlugQuery>(
      GET_PRODUCT_BY_SLUG.toString(),
      { slug },
    );
    if (data?.productBySlug) {
      return data.productBySlug;
    }
  } catch (err) {
    // Log loudly so the tech lead notices — every product page falling back
    // to the minimal query is a sign the backend redeploy is overdue.
    console.error(
      '[getProductBySlug] Sprint 4 query failed, falling back to minimal query',
      { slug, error: err instanceof Error ? err.message : err },
    );
  }

  // Tier 2: minimal query (no Sprint 4 fields).
  try {
    const data = await client.request<GetProductBySlugQuery>(
      GET_PRODUCT_BY_SLUG_MINIMAL.toString(),
      { slug },
    );
    return data?.productBySlug ?? null;
  } catch (err) {
    console.error('[getProductBySlug] minimal query also failed', {
      slug,
      error: err instanceof Error ? err.message : err,
    });
    return null;
  }
}
