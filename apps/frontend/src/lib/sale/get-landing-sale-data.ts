import { createServerGraphQLClient } from "@/lib/graphql/server-client-factory";

export type SaleVariant = {
  _id: string;
  sku: string;
  name: string;
  price: number;
  mrp: number;
  discountPercent: number;
  packageSize: string;
  stockQuantity: number;
  availabilityStatus: string;
  thumbnailUrl: string;
  isDefault: boolean;
  isActive: boolean;
  isSaleVariant: boolean;
};

export type SaleProduct = {
  _id: string;
  name: string;
  slug: string;
  brand: string;
  defaultVariant: SaleVariant | null;
  variants: SaleVariant[];
};

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

const SALE_PRODUCTS_QUERY = `
  query GetNearExpirySaleProducts {
    nearExpirySaleProducts {
      _id
      name
      slug
      brand
      defaultVariant {
        _id
        sku
        name
        price
        mrp
        discountPercent
        packageSize
        stockQuantity
        availabilityStatus
        thumbnailUrl
        isDefault
        isActive
        isSaleVariant
      }
      variants {
        _id
        sku
        name
        price
        mrp
        discountPercent
        packageSize
        stockQuantity
        availabilityStatus
        thumbnailUrl
        isDefault
        isActive
        isSaleVariant
      }
    }
  }
`;

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

export async function getSaleProducts(): Promise<SaleProduct[]> {
  const client = createServerGraphQLClient();
  try {
    const data = await client.request<{
      nearExpirySaleProducts: SaleProduct[];
    }>(SALE_PRODUCTS_QUERY);
    return data?.nearExpirySaleProducts ?? [];
  } catch (err) {
    console.error("[getSaleProducts] fetch failed", err);
    return [];
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
