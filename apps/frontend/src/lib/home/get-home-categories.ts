import { createServerGraphQLClient } from "@/lib/graphql/server-client-factory";
import { GET_ROOT_CATEGORIES } from "@/lib/queries/categories";
import type { GetRootCategoriesQuery } from "@/gql/graphql";
import { unstable_noStore } from "next/cache";

export async function getHomeCategories(
  limit: number = 20,
): Promise<GetRootCategoriesQuery["rootCategories"]> {
  unstable_noStore();

  const client = createServerGraphQLClient();

  const data = await client.request<GetRootCategoriesQuery>(
    GET_ROOT_CATEGORIES.toString(),
    {
      pagination: { limit, page: 1 },
      includeArchived: false,
    },
  );

  return data.rootCategories;
}
