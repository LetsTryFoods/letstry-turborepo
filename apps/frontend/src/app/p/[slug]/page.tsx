import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPillarBySlug } from "@/lib/pillar";
import { PillarRenderer } from "@/components/pillar/PillarRenderer";
import { getCdnUrl } from "@/lib/image-utils";

export const revalidate = 1800;

const SITE_URL = (
  process.env.NEXT_PUBLIC_BASE_URL || "https://letstryfoods.com"
).replace(/\/$/, "");

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const pillar = await getPillarBySlug(slug);
  if (!pillar) return { title: "Pillar not found" };

  // If the pillar has a customRoute set, redirect metadata canonical there;
  // otherwise default to /p/<slug>.
  const url = pillar.customRoute
    ? `${SITE_URL}${pillar.customRoute}`
    : `${SITE_URL}/p/${pillar.slug}`;

  const title = pillar.seo?.metaTitle || `${pillar.title} | Let's Try Foods`;
  const description = pillar.seo?.metaDescription || pillar.intro;
  return {
    title: { absolute: title },
    description,
    keywords: pillar.seo?.metaKeywords || [],
    alternates: { canonical: pillar.seo?.canonicalUrl || url },
    openGraph: {
      title: pillar.seo?.ogTitle || title,
      description: pillar.seo?.ogDescription || description,
      url,
      type: "website",
      siteName: "Let's Try Foods",
      images: pillar.seo?.ogImage
        ? [{ url: getCdnUrl(pillar.seo.ogImage) }]
        : pillar.heroImageUrl
          ? [{ url: getCdnUrl(pillar.heroImageUrl) }]
          : [],
    },
    twitter: {
      card:
        (pillar.seo?.twitterCard as "summary" | "summary_large_image") ||
        "summary_large_image",
      title: pillar.seo?.twitterTitle || title,
      description: pillar.seo?.twitterDescription || description,
      images: pillar.seo?.twitterImage
        ? [getCdnUrl(pillar.seo.twitterImage)]
        : undefined,
    },
    robots: pillar.seo?.robots || undefined,
  };
}

/**
 * Default pillar route at /p/<slug>. Pillars that prefer clean URLs set
 * `customRoute` (e.g. /no-palm-oil-snacks) and are also served from the
 * dedicated route or the dynamic [slug] route — this /p/<slug> route stays
 * available as the safe default and an escape hatch for slug collisions.
 */
export default async function PillarPage({ params }: PageProps) {
  const { slug } = await params;
  const pillar = await getPillarBySlug(slug);
  if (!pillar || !pillar.isActive) notFound();

  const url = pillar.customRoute
    ? `${SITE_URL}${pillar.customRoute}`
    : `${SITE_URL}/p/${pillar.slug}`;

  return <PillarRenderer pillar={pillar} url={url} />;
}
