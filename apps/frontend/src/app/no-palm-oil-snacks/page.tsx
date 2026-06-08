import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getCategoryLandingPageBySlug } from "@/lib/category-landing-page/get-category-landing-page";
import { getPillarByCustomRoute } from "@/lib/pillar";
import { PillarRenderer } from "@/components/pillar/PillarRenderer";
import { ProductDetailFAQ } from "@/components/product-page/ProductDetailFAQ";
import { getCdnUrl } from "@/lib/image-utils";

const PAGE_SLUG = "no-palm-oil-snacks";
const PAGE_PATH = `/${PAGE_SLUG}`;
const SITE_URL = (
  process.env.NEXT_PUBLIC_BASE_URL || "https://letstryfoods.com"
).replace(/\/$/, "");
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`;

/**
 * Resolution order for /no-palm-oil-snacks:
 *
 *  1. Pillar with customRoute === '/no-palm-oil-snacks' → render via the
 *     unified PillarRenderer. This is the new path content team uses.
 *
 *  2. CategoryLandingPage with slug 'no-palm-oil-snacks' → render via the
 *     existing landing-page layout. This is the legacy path that pre-dates
 *     the Pillars CMS — preserved as a safety net so a missing/inactive
 *     Pillar never takes the page down.
 *
 *  3. notFound() — only if both CMS sources are empty (would only happen if
 *     someone manually deletes both the Pillar AND the CategoryLandingPage).
 */
export async function generateMetadata(): Promise<Metadata> {
  // Prefer Pillar if it exists and is active.
  const pillar = await getPillarByCustomRoute(PAGE_PATH);
  if (pillar && pillar.isActive) {
    const title = pillar.seo?.metaTitle || `${pillar.title} | Let's Try Foods`;
    const description = pillar.seo?.metaDescription || pillar.intro;
    return {
      title: { absolute: title },
      description,
      keywords: pillar.seo?.metaKeywords || [],
      alternates: { canonical: pillar.seo?.canonicalUrl || PAGE_URL },
      openGraph: {
        title: pillar.seo?.ogTitle || title,
        description: pillar.seo?.ogDescription || description,
        url: PAGE_URL,
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

  // Fall back to legacy CategoryLandingPage flow.
  const page = await getCategoryLandingPageBySlug(PAGE_SLUG);
  if (!page) return { title: "Not Found | Let's Try" };

  const seo = page.seo;
  const title = seo?.metaTitle || page.pageTitle;
  const description = seo?.metaDescription || page.description || "";

  return {
    title: { absolute: title },
    description,
    keywords: seo?.metaKeywords || [],
    alternates: { canonical: seo?.canonicalUrl || PAGE_URL },
    openGraph: {
      title: seo?.ogTitle || title,
      description: seo?.ogDescription || description,
      url: PAGE_URL,
      type: "website",
      siteName: "Let's Try Foods",
      images: seo?.ogImage
        ? [{ url: seo.ogImage, width: 1200, height: 630, alt: title }]
        : [],
    },
    twitter: {
      card: "summary_large_image",
      title: seo?.ogTitle || title,
      description: seo?.ogDescription || description,
      images: seo?.ogImage ? [seo.ogImage] : [],
    },
  };
}

export default async function NoPalmOilSnacksPage() {
  // 1) Pillar takes precedence
  const pillar = await getPillarByCustomRoute(PAGE_PATH);
  if (pillar && pillar.isActive) {
    return <PillarRenderer pillar={pillar} url={PAGE_URL} />;
  }

  // 2) Legacy CategoryLandingPage fallback (existing behaviour preserved)
  const page = await getCategoryLandingPageBySlug(PAGE_SLUG);
  if (!page) notFound();

  const sortedTiles = [...page.tiles].sort((a, b) => a.position - b.position);
  const sortedFaqs = [...page.faqs].sort((a, b) => a.position - b.position);

  const faqSchema = sortedFaqs.length
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: sortedFaqs.map((f) => ({
          "@type": "Question",
          name: f.question,
          acceptedAnswer: { "@type": "Answer", text: f.answer },
        })),
      }
    : null;

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      {
        "@type": "ListItem",
        position: 2,
        name: page.pageTitle,
        item: PAGE_URL,
      },
    ],
  };

  const speakableSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${PAGE_URL}#speakable`,
    url: PAGE_URL,
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: ['[data-speakable="true"]'],
    },
  };

  const paragraphs = (page.description || "").split("\n\n").filter(Boolean);

  return (
    <>
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(speakableSchema) }}
      />

      <main className="min-h-screen bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <nav className="text-sm text-gray-500 mb-6">
            <Link href="/" className="hover:text-gray-800">
              Home
            </Link>
            <span className="mx-2">/</span>
            <span className="text-gray-800">{page.pageTitle}</span>
          </nav>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {page.pageTitle}
          </h1>

          {paragraphs.map((para, i) => (
            <p
              key={i}
              data-speakable={i === 0 ? "true" : undefined}
              className="text-base sm:text-lg text-gray-700 leading-relaxed mb-4"
            >
              {para}
            </p>
          ))}

          {sortedTiles.length > 0 && (
            <section
              aria-labelledby="categories-heading"
              className="mt-6 mb-14"
            >
              <h2
                id="categories-heading"
                className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-6"
              >
                {page.tilesHeading || "Shop by Category"}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                {sortedTiles.map((tile, i) => {
                  const isExternal = tile.shopNowUrl.startsWith("http");
                  const cardClass =
                    "block rounded-2xl border border-gray-200 overflow-hidden hover:border-gray-400 hover:shadow-md transition";

                  const cardInner = (
                    <>
                      {tile.imageUrl && (
                        <div className="relative aspect-[4/3] w-full bg-amber-50">
                          <Image
                            src={tile.imageUrl}
                            alt={tile.name}
                            fill
                            className="object-cover"
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          />
                        </div>
                      )}
                      <div className="p-5">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {tile.name}
                        </h3>
                        {tile.blurb && (
                          <p className="text-sm text-gray-600 leading-relaxed">
                            {tile.blurb}
                          </p>
                        )}
                        <span className="inline-block mt-3 text-sm font-semibold text-[#0C5273]">
                          Shop Now →
                        </span>
                      </div>
                    </>
                  );

                  return isExternal ? (
                    <a
                      key={i}
                      href={tile.shopNowUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cardClass}
                    >
                      {cardInner}
                    </a>
                  ) : (
                    <Link key={i} href={tile.shopNowUrl} className={cardClass}>
                      {cardInner}
                    </Link>
                  );
                })}
              </div>
            </section>
          )}

          {sortedFaqs.length > 0 && (
            <div className="mb-8">
              <ProductDetailFAQ
                heading={page.faqHeading || "Frequently Asked Questions"}
                faqs={sortedFaqs.map((f) => ({ q: f.question, a: f.answer }))}
              />
            </div>
          )}
        </div>
      </main>
    </>
  );
}
