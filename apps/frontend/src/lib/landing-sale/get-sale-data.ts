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

export type SaleProductItem = {
  _id: string;
  name: string;
  slug: string;
  defaultVariant?: {
    _id: string;
    thumbnailUrl?: string;
    price: number;
    mrp?: number;
    discountPercent?: number;
  };
  variants: {
    _id: string;
    packageSize?: string;
    price: number;
    mrp?: number;
    availabilityStatus: string;
  }[];
};

export type SaleProductsMeta = {
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

const SALE_PRODUCTS_QUERY = `
  query SaleProductsPaginatedServer($pagination: PaginationInput) {
    saleProductsPaginated(pagination: $pagination) {
      items {
        _id
        name
        slug
        defaultVariant {
          _id
          thumbnailUrl
          price
          mrp
          discountPercent
        }
        variants {
          _id
          packageSize
          price
          mrp
          availabilityStatus
        }
      }
      meta {
        totalCount
        page
        limit
        totalPages
        hasNextPage
        hasPreviousPage
      }
    }
  }
`;

/** Server-side fetch — used to pre-populate page 1 so there's no client spinner on first paint */
export async function getSaleProductsFirstPage(
  limit = 24,
): Promise<{ items: SaleProductItem[]; meta: SaleProductsMeta } | null> {
  // Revalidate every 10 minutes so the page stays fresh without a per-request DB hit
  const client = createServerGraphQLClient(undefined, 600);
  try {
    const data = await client.request<{
      saleProductsPaginated: { items: SaleProductItem[]; meta: SaleProductsMeta };
    }>(SALE_PRODUCTS_QUERY, { pagination: { page: 1, limit } });
    return data?.saleProductsPaginated ?? null;
  } catch (err) {
    console.error("[getSaleProductsFirstPage] fetch failed", err);
    return null;
  }
}

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
