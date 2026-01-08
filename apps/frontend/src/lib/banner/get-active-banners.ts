import { createServerGraphQLClient } from '@/lib/graphql/server-client-factory';
import { GET_ACTIVE_BANNERS } from '@/lib/queries/banners';
import type { GetActiveBannersQuery } from '@/gql/graphql';

export async function getActiveBanners(): Promise<GetActiveBannersQuery['activeBanners']> {
  const client = createServerGraphQLClient();
  
  const data = await client.request<GetActiveBannersQuery>(
    GET_ACTIVE_BANNERS.toString()
  );

  return data.activeBanners;
}
