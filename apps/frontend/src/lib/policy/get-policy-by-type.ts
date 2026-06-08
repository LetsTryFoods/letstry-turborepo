import { createServerGraphQLClient } from "@/lib/graphql/server-client-factory";
import { GET_POLICIES_BY_TYPE } from "@/lib/queries/policies";
import type { GetPoliciesByTypeQuery } from "@/gql/graphql";

export async function getPolicyByType(
  type: string,
): Promise<GetPoliciesByTypeQuery["policiesByType"][0] | null> {
  const client = createServerGraphQLClient();

  try {
    const data = await client.request<GetPoliciesByTypeQuery>(
      GET_POLICIES_BY_TYPE.toString(),
      { type },
    );

    return data.policiesByType?.[0] || null;
  } catch (error) {
    console.error("Error fetching policy by type:", error);
    return null;
  }
}
