import { createServerGraphQLClient } from '@/lib/graphql/server-client-factory';
import { GET_CATEGORY_LANDING_PAGE_BY_SLUG } from '@/lib/queries/category-landing-pages';

export interface CategoryTile {
  name: string;
  blurb?: string | null;
  imageUrl?: string | null;
  shopNowUrl: string;
  position: number;
}

export interface CategoryFaq {
  question: string;
  answer: string;
  position: number;
}

export interface CategoryLandingPage {
  _id: string;
  slug: string;
  pageTitle: string;
  description?: string | null;
  tilesHeading?: string | null;
  faqHeading?: string | null;
  tiles: CategoryTile[];
  faqs: CategoryFaq[];
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
  createdAt: string;
  updatedAt: string;
}

export async function getCategoryLandingPageBySlug(
  slug: string,
): Promise<CategoryLandingPage | null> {
  // 30-minute ISR cache — serves stale data on transient backend failures
  const client = createServerGraphQLClient(undefined, 1800);
  try {
    const data = await client.request<{
      categoryLandingPageBySlug: CategoryLandingPage | null;
    }>(GET_CATEGORY_LANDING_PAGE_BY_SLUG, { slug });
    return data.categoryLandingPageBySlug;
  } catch {
    return null;
  }
}
