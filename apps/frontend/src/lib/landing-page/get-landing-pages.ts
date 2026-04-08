import { createServerGraphQLClient } from '@/lib/graphql/server-client-factory';
import {
  GET_ACTIVE_LANDING_PAGES_QUERY,
  GET_LANDING_PAGE_BY_SLUG_QUERY,
  GET_PRODUCTS_BY_SLUG_LIST_QUERY,
} from '@/lib/queries/landing-pages';

export interface SectionPlatformLink {
  platform: string;
  url: string;
}

export interface LandingPageSection {
  type: string;
  title: string;
  subtitle?: string | null;
  description?: string | null;
  imageUrl?: string | null;
  buttonText?: string | null;
  buttonLink?: string | null;
  productSlugs: string[];
  platformLinks: SectionPlatformLink[];
  backgroundColor?: string | null;
  position: number;
  isActive: boolean;
}

export interface LandingPage {
  _id: string;
  slug: string;
  title: string;
  description?: string | null;
  thumbnailUrl?: string | null;
  sections: LandingPageSection[];
  seo?: {
    metaTitle?: string | null;
    metaDescription?: string | null;
    metaKeywords?: string[] | null;
    canonicalUrl?: string | null;
    ogTitle?: string | null;
    ogDescription?: string | null;
    ogImage?: string | null;
  } | null;
  isActive: boolean;
  position: number;
  createdAt: string;
  updatedAt: string;
}

export interface LandingProduct {
  _id: string;
  name: string;
  slug: string;
  defaultVariant: {
    price: number;
    mrp: number;
    discountPercent: number;
    thumbnailUrl: string;
    availabilityStatus: string;
  } | null;
}

interface GetActiveLandingPagesResponse {
  activeLandingPages: LandingPage[];
}

interface GetLandingPageBySlugResponse {
  landingPageBySlug: LandingPage | null;
}

interface GetProductsBySlugListResponse {
  productsBySlugList: LandingProduct[];
}

export async function getActiveLandingPages(): Promise<LandingPage[]> {
  const client = createServerGraphQLClient();
  try {
    const data = await client.request<GetActiveLandingPagesResponse>(
      GET_ACTIVE_LANDING_PAGES_QUERY
    );
    return data.activeLandingPages;
  } catch {
    return [];
  }
}

export async function getLandingPageBySlug(slug: string): Promise<LandingPage | null> {
  const client = createServerGraphQLClient();
  try {
    const data = await client.request<GetLandingPageBySlugResponse>(
      GET_LANDING_PAGE_BY_SLUG_QUERY,
      { slug }
    );
    return data.landingPageBySlug;
  } catch {
    return null;
  }
}

export async function getProductsBySlugList(slugs: string[]): Promise<LandingProduct[]> {
  if (!slugs.length) return [];
  const client = createServerGraphQLClient();
  try {
    const data = await client.request<GetProductsBySlugListResponse>(
      GET_PRODUCTS_BY_SLUG_LIST_QUERY,
      { slugs }
    );
    return data.productsBySlugList;
  } catch {
    return [];
  }
}
