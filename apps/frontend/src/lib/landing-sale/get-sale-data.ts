import { createServerGraphQLClient } from "@/lib/graphql/server-client-factory";

export type SaleBanner = {
  _id: string;
  name: string;
  headline: string;
  subheadline: string;
  description?: string;
  imageUrl: string;
  mobileImageUrl: string;
  url: string;
  ctaText: string;
  position: number;
  isActive: boolean;
  bannerType?: string;
};

const SALE_BANNERS_QUERY = `
  query GetActiveSaleBanners {
    activeSaleBanners {
      _id
      name
      headline
      subheadline
      description
      imageUrl
      mobileImageUrl
      url
      ctaText
      position
      isActive
      bannerType
    }
  }
`;

export async function getSaleBanners(): Promise<SaleBanner[]> {
  const client = createServerGraphQLClient();
  try {
    const data = await client.request<{ activeSaleBanners: SaleBanner[] }>(
      SALE_BANNERS_QUERY,
    );
    return data?.activeSaleBanners ?? [];
  } catch (err) {
    console.error("[getSaleBanners] fetch failed", err);
    return [];
  }
}
