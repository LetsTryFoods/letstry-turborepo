import { createServerGraphQLClient } from "@/lib/graphql/server-client-factory";
import { GET_CATEGORY_WITH_CHILDREN } from "@/lib/queries/categories";
import type { GetCategoryWithChildrenQuery } from "@/gql/graphql";

export async function getWholesomeChoices(): Promise<
  GetCategoryWithChildrenQuery["categoryBySlug"]
> {
  const client = createServerGraphQLClient();

  const queryString = (
    GET_CATEGORY_WITH_CHILDREN as unknown as { value: string }
  ).value;

  const data = await client.request<GetCategoryWithChildrenQuery>(queryString, {
    slug: "wholesome-choices",
    includeArchived: false,
  });

  return data.categoryBySlug;
}
