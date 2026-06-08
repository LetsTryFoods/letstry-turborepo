import { createServerGraphQLClient } from "@/lib/graphql/server-client-factory";
import {
  GET_PILLAR_BY_SLUG,
  GET_ACTIVE_PILLARS,
  GET_PILLAR_BY_CUSTOM_ROUTE,
} from "@/lib/queries/pillars";

export interface PillarSection {
  heading: string;
  body: string;
  speakable?: boolean | null;
  featuredProductIds?: string[] | null;
}

export interface PillarFaqEntry {
  question: string;
  answer: string;
}

export interface PillarCategoryTile {
  categorySlug: string;
  name: string;
  blurb: string;
}

export interface PillarSeo {
  metaTitle?: string | null;
  metaDescription?: string | null;
  metaKeywords?: string[] | null;
  canonicalUrl?: string | null;
  ogTitle?: string | null;
  ogDescription?: string | null;
  ogImage?: string | null;
  twitterCard?: string | null;
  twitterTitle?: string | null;
  twitterDescription?: string | null;
  twitterImage?: string | null;
  robots?: string | null;
}

export interface Pillar {
  _id: string;
  slug: string;
  customRoute?: string | null;
  title: string;
  intro: string;
  heroImageUrl?: string | null;
  categoryTiles: PillarCategoryTile[];
  featuredProductIds: string[];
  sections: PillarSection[];
  faqs: PillarFaqEntry[];
  relatedPillarSlugs: string[];
  isActive: boolean;
  seo?: PillarSeo | null;
}

export async function getPillarBySlug(slug: string): Promise<Pillar | null> {
  const client = createServerGraphQLClient();
  try {
    const data = await client.request<{ pillarBySlug: Pillar }>(
      GET_PILLAR_BY_SLUG,
      { slug },
    );
    return data?.pillarBySlug ?? null;
  } catch (e) {
    console.error("getPillarBySlug failed", e);
    return null;
  }
}

export async function getActivePillars(): Promise<
  Pick<Pillar, "_id" | "slug" | "title" | "intro" | "isActive">[]
> {
  const client = createServerGraphQLClient();
  try {
    const data = await client.request<{
      activePillars: Pick<
        Pillar,
        "_id" | "slug" | "title" | "intro" | "isActive"
      >[];
    }>(GET_ACTIVE_PILLARS);
    return data?.activePillars ?? [];
  } catch (e) {
    console.error("getActivePillars failed", e);
    return [];
  }
}

/**
 * Look up an active pillar by its customRoute (e.g. '/no-palm-oil-snacks').
 * Used by the storefront [slug] dynamic route to resolve clean-URL pillars
 * before falling through to category lookup. Returns null on no match or
 * fetch error.
 */
export async function getPillarByCustomRoute(
  route: string,
): Promise<Pillar | null> {
  const client = createServerGraphQLClient();
  try {
    const data = await client.request<{ pillarByCustomRoute: Pillar | null }>(
      GET_PILLAR_BY_CUSTOM_ROUTE,
      { route },
    );
    return data?.pillarByCustomRoute ?? null;
  } catch (e) {
    console.error("getPillarByCustomRoute failed", e);
    return null;
  }
}
