import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getCategoryBySlug } from "@/lib/category";
import { getCategoryLandingPageBySlug } from "@/lib/category-landing-page/get-category-landing-page";
import { CategoryPageContainer } from "@/components/category-page/CategoryPageContainer";
import { CategoryHeader } from "@/components/category-page/CategoryHeader";
import { ProductGrid } from "@/components/category-page/ProductGrid";
import { ProductDetailFAQ } from "@/components/product-page/ProductDetailFAQ";
import type { Product } from "@/components/category-page/ProductCard";
import { getCdnUrl } from "@/lib/image-utils";

export const revalidate = 1800;

const SITE_URL = (
  process.env.NEXT_PUBLIC_BASE_URL || "https://letstryfoods.com"
).replace(/\/$/, "");

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

// ─── helpers ─────────────────────────────────────────────────────────────────

function mapProductData(apiProduct: any): Product {
  const defaultVariant = apiProduct.defaultVariant;
  const variants =
    apiProduct.availableVariants?.map((v: any) => ({
      id: v._id,
      weight: v.packageSize || `${v.weight}${v.weightUnit}`,
      price: v.price,
      mrp: v.mrp,
    })) || [];

  if (variants.length === 0 && defaultVariant) {
    variants.push({
      id: defaultVariant._id || apiProduct._id,
      weight: defaultVariant.packageSize || "Standard",
      price: defaultVariant.price,
      mrp: defaultVariant.mrp,
    });
  }

  const tags = apiProduct.tags || [];
  let badge: Product["badge"] = undefined;
  if (tags.includes("trending"))
    badge = { label: "Trending", variant: "trending" };
  else if (tags.includes("bestseller"))
    badge = { label: "Bestseller", variant: "bestseller" };

  return {
    id: apiProduct._id,
    name: apiProduct.name,
    slug: apiProduct.slug,
    image: getCdnUrl(defaultVariant?.thumbnailUrl || apiProduct.thumbnailUrl),
    price: defaultVariant?.price || 0,
    mrp: defaultVariant?.mrp,
    variants,
    badge,
  };
}

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const [category, landingPage] = await Promise.all([
    getCategoryBySlug(slug).catch(() => null),
    getCategoryLandingPageBySlug(slug),
  ]);

  if (!category && !landingPage) {
    return { title: "Category Not Found | Letstry" };
  }

  const pageUrl = `${SITE_URL}/category/${slug}`;

  // Prefer landing page SEO → category SEO → defaults
  const lpSeo = landingPage?.seo;
  const catSeo = (category as any)?.seo;

  const title =
    lpSeo?.metaTitle ||
    catSeo?.metaTitle ||
    (landingPage?.pageTitle
      ? `${landingPage.pageTitle} | Let's Try Foods`
      : null) ||
    (category
      ? `${category.name} | Let's Try Foods`
      : "Category | Let's Try Foods");

  const description =
    lpSeo?.metaDescription ||
    catSeo?.metaDescription ||
    landingPage?.description?.split("\n\n")[0] ||
    category?.description ||
    `Shop ${category?.name || ""} at Let's Try Foods.`;

  const ogImage =
    lpSeo?.ogImage ||
    catSeo?.ogImage ||
    (category?.imageUrl ? getCdnUrl(category.imageUrl) : undefined);

  return {
    title,
    description,
    keywords: lpSeo?.metaKeywords || catSeo?.metaKeywords || [],
    alternates: {
      canonical: lpSeo?.canonicalUrl || catSeo?.canonicalUrl || pageUrl,
    },
    openGraph: {
      title: lpSeo?.ogTitle || catSeo?.ogTitle || title,
      description: lpSeo?.ogDescription || catSeo?.ogDescription || description,
      url: pageUrl,
      type: "website",
      siteName: "Let's Try Foods",
      images: ogImage
        ? [{ url: ogImage, width: 1200, height: 630, alt: title as string }]
        : [],
    },
    twitter: {
      card: "summary_large_image",
      title: lpSeo?.ogTitle || catSeo?.ogTitle || title,
      description: lpSeo?.ogDescription || catSeo?.ogDescription || description,
      images: ogImage ? [ogImage] : [],
    },
  };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function CategoryPage({
  params,
  searchParams,
}: PageProps) {
  const { slug } = await params;
  const { type } = await searchParams;
  const categoryType = type === "special" ? "special" : "default";

  // Parallel fetch: category products + rich landing-page content
  const [category, landingPage] = await Promise.all([
    getCategoryBySlug(slug).catch(() => null),
    getCategoryLandingPageBySlug(slug),
  ]);

  if (!category && !landingPage) notFound();

  const products = category ? category.products.map(mapProductData) : [];
  const sortedTiles = landingPage
    ? [...landingPage.tiles].sort((a, b) => a.position - b.position)
    : [];
  const sortedFaqs = landingPage
    ? [...landingPage.faqs].sort((a, b) => a.position - b.position)
    : [];

  const pageTitle = landingPage?.pageTitle || category?.name || "";
  const paragraphs = (landingPage?.description || "")
    .split("\n\n")
    .filter(Boolean);
  const pageUrl = `${SITE_URL}/category/${slug}`;

  // Structured data
  const faqSchema =
    sortedFaqs.length > 0
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
      { "@type": "ListItem", position: 2, name: pageTitle, item: pageUrl },
    ],
  };

  // ── Render: basic layout when no landing page configured ──────────────────
  if (!landingPage) {
    return (
      <CategoryPageContainer>
        <CategoryHeader
          title={category!.name}
          productCount={category!.productCount}
        />
        <ProductGrid
          products={products}
          categoryType={categoryType}
          slug={slug}
        />
      </CategoryPageContainer>
    );
  }

  // ── Render: enriched layout when landing page exists ──────────────────────
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

      <main className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          {/* Breadcrumb */}
          <nav className="text-sm text-gray-500 mb-6">
            <Link href="/" className="hover:text-gray-800">
              Home
            </Link>
            <span className="mx-2">/</span>
            <span className="text-gray-800">{pageTitle}</span>
          </nav>

          {/* H1 + description */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {pageTitle}
          </h1>
          {paragraphs.map((para, i) => (
            <p
              key={i}
              data-speakable={i === 0 ? "true" : undefined}
              className="text-base sm:text-lg text-gray-700 leading-relaxed mb-4 max-w-3xl"
            >
              {para}
            </p>
          ))}

          {/* Sub-category tiles */}
          {sortedTiles.length > 0 && (
            <section aria-labelledby="tiles-heading" className="mt-8 mb-12">
              <h2
                id="tiles-heading"
                className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-6"
              >
                {landingPage.tilesHeading || "Shop by Category"}
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {sortedTiles.map((tile, i) => {
                  const isExternal = tile.shopNowUrl.startsWith("http");
                  const cardClass =
                    "block rounded-2xl border border-gray-200 overflow-hidden hover:border-gray-400 hover:shadow-md transition group";

                  const cardInner = (
                    <>
                      {tile.imageUrl ? (
                        <div className="relative aspect-[4/3] w-full bg-amber-50">
                          <Image
                            src={tile.imageUrl}
                            alt={tile.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                          />
                        </div>
                      ) : (
                        <div className="aspect-[4/3] w-full bg-amber-50" />
                      )}
                      <div className="p-4">
                        <h3 className="text-base font-semibold text-gray-900 mb-1">
                          {tile.name}
                        </h3>
                        {tile.blurb && (
                          <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">
                            {tile.blurb}
                          </p>
                        )}
                        <span className="inline-block mt-2 text-xs font-semibold text-[#0C5273]">
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

          {/* Product grid */}
          {products.length > 0 && (
            <section aria-labelledby="products-heading" className="mb-12">
              <h2
                id="products-heading"
                className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-6"
              >
                {category?.name ? `Shop ${category.name}` : "Browse Products"}
                <span className="ml-2 text-base font-normal text-gray-500">
                  ({products.length} products)
                </span>
              </h2>
              <ProductGrid
                products={products}
                categoryType={categoryType}
                slug={slug}
              />
            </section>
          )}

          {/* FAQ */}
          {sortedFaqs.length > 0 && (
            <div className="mb-10">
              <ProductDetailFAQ
                heading={landingPage.faqHeading || "Frequently Asked Questions"}
                faqs={sortedFaqs.map((f) => ({ q: f.question, a: f.answer }))}
              />
            </div>
          )}
        </div>
      </main>
    </>
  );
}
