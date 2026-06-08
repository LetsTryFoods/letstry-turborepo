import { createServerGraphQLClient } from "@/lib/graphql/server-client-factory";
import { GET_PRODUCTS_BY_CATEGORY } from "@/lib/queries/products";
import type { GetProductsByCategoryQuery } from "@/gql/graphql";

/**
 * Fetch bestseller products for the home page carousel.
 *
 * Both GraphQL calls are wrapped in try/catch so a backend hiccup just
 * renders an empty bestseller section instead of crashing the home page.
 */
export async function getBestsellerProducts(
  categorySlug: string = "best-selling",
  limit: number = 20,
): Promise<GetProductsByCategoryQuery["productsByCategory"]["items"]> {
  const client = createServerGraphQLClient();

  let categoryId: string | undefined;
  try {
    const categoryQuery = await client.request<any>(
      `query GetCategoryBySlug($slug: String!) {
        categoryBySlug(slug: $slug) {
          id
        }
      }`,
      { slug: categorySlug },
    );
    categoryId = categoryQuery?.categoryBySlug?.id;
  } catch (err) {
    console.error("[getBestsellerProducts] category lookup failed", err);
    return [];
  }

  if (!categoryId) {
    return [];
  }

  try {
    const data = await client.request<GetProductsByCategoryQuery>(
      GET_PRODUCTS_BY_CATEGORY.toString(),
      {
        categoryId,
        pagination: { page: 1, limit },
      },
    );
    return data?.productsByCategory?.items ?? [];
  } catch (err) {
    console.error("[getBestsellerProducts] products fetch failed", err);
    return [];
  }
}
