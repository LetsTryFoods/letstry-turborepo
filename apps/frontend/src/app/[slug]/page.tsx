import { getCategoryBySlug } from "@/lib/category";
import { CategoryPageContainer } from "@/components/category-page/CategoryPageContainer";
import { CategoryHeader } from "@/components/category-page/CategoryHeader";
import { ProductGrid } from "@/components/category-page/ProductGrid";
import { CategoryFaqSection } from "@/components/category-page/CategoryFaqSection";
import { CategoryAnswerBox } from "@/components/category-page/CategoryAnswerBox";
import { Product } from "@/components/category-page/ProductCard";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { PillarRenderer } from "@/components/pillar/PillarRenderer";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getCdnUrl } from "@/lib/image-utils";
import { getCategoryOverride } from "@/lib/seo/overrides";
import { getCategoryFaqs } from "@/lib/seo/category-faqs";
import { getPillarByCustomRoute, type Pillar } from "@/lib/pillar";

export const revalidate = 1800;

const SITE_URL = (
  process.env.NEXT_PUBLIC_BASE_URL || "https://letstryfoods.com"
).replace(/\/$/, "");

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;

  // Resolve clean-URL pillars FIRST so /no-maida-snacks etc. don't fall
  // through to category lookup. customRoute on a pillar always wins over
  // a category at the same slug.
  const pillar = await getPillarByCustomRoute(`/${slug}`);
  if (pillar && pillar.isActive) {
    const url = `${SITE_URL}/${slug}`;
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

  const category = await getCategoryBySlug(slug);
  if (category) {
    const seo = category.seo;
    const override = getCategoryOverride(slug);

    const defaultTitle = `${category.name} – Buy Online | Let's Try Foods`;
    const countHint = category.productCount
      ? `Choose from ${category.productCount} ${category.productCount === 1 ? "product" : "products"}. `
      : "";
    const defaultDescription =
      category.description ||
      `Shop ${category.name} at Let's Try Foods. ${countHint}Shipped across India.`.trim();

    const finalTitle = seo?.metaTitle || override?.title || defaultTitle;
    const finalDescription =
      seo?.metaDescription || override?.description || defaultDescription;
    const canonical = seo?.canonicalUrl || `${SITE_URL}/${slug}`;

    return {
      title: { absolute: finalTitle },
      description: finalDescription,
      keywords: seo?.metaKeywords || [],
      alternates: {
        canonical,
      },
      openGraph: {
        title: seo?.ogTitle || finalTitle,
        description: seo?.ogDescription || finalDescription,
        url: canonical,
        images: seo?.ogImage
          ? [{ url: getCdnUrl(seo.ogImage) }]
          : category.imageUrl
            ? [{ url: getCdnUrl(category.imageUrl) }]
            : [],
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title: seo?.ogTitle || finalTitle,
        description: seo?.ogDescription || finalDescription,
        images: seo?.ogImage
          ? [getCdnUrl(seo.ogImage)]
          : category.imageUrl
            ? [getCdnUrl(category.imageUrl)]
            : [],
      },
    };
  }

  return {
    title: "Page Not Found | Letstry",
    description: "The requested page could not be found.",
  };
}

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
  let badge = undefined;

  if (tags.includes("trending")) {
    badge = { label: "Trending", variant: "trending" as const };
  } else if (tags.includes("bestseller")) {
    badge = { label: "Bestseller", variant: "bestseller" as const };
  }

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

export default async function DynamicSlugPage({
  params,
  searchParams,
}: PageProps) {
  const { slug } = await params;
  const { type } = await searchParams;

  // Resolution order:
  //   1) Pillar with customRoute === `/<slug>` (clean-URL pillars)
  //   2) Category at slug `<slug>`
  //   3) notFound
  //
  // Pillars take precedence to keep clean URLs cohesive — a pillar named
  // `no-maida-snacks` with customRoute `/no-maida-snacks` resolves here.
  // Admin-side validation prevents accidental shadowing of category slugs.
  let pillar: Pillar | null = null;
  try {
    pillar = await getPillarByCustomRoute(`/${slug}`);
  } catch (error) {
    console.error("Error fetching pillar by customRoute:", error);
  }

  if (pillar && pillar.isActive) {
    return <PillarRenderer pillar={pillar} url={`${SITE_URL}/${slug}`} />;
  }

  // Fetch the category. Sprint-3 introduced a data-driven render path
  // (CategoryAnswerBox + CategoryFaqSection) that replaced the legacy
  // override-driven path; both ended up in the file at the same time
  // and the legacy version shadowed `category` with an inner const,
  // making the outer `let` permanently null and the rest of the
  // function unreachable as far as TypeScript was concerned (build
  // failed with "Property 'products' does not exist on type 'never'").
  // Removing the duplicate path here so the data-driven render is the
  // single source of truth.
  let category: Awaited<ReturnType<typeof getCategoryBySlug>> | null = null;
  try {
    category = await getCategoryBySlug(slug);
  } catch (error) {
    console.error("Error fetching category:", error);
  }

  if (!category) {
    notFound();
  }

  const categoryType = type === "special" ? "special" : "default";
  const products = category.products.map(mapProductData);
  const categoryUrl = `${SITE_URL}/${slug}`;
  const faqBlock = getCategoryFaqs(slug);

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      {
        "@type": "ListItem",
        position: 2,
        name: category.name,
        item: categoryUrl,
      },
    ],
  };

  // Sprint 4 — CollectionPage wraps the category page so search engines
  // see "this is a collection of products" rather than just an item list.
  // Pairs with ItemList for full eligibility.
  const collectionPageSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${categoryUrl}#collection`,
    url: categoryUrl,
    name: category.name,
    description:
      category.description || `Shop ${category.name} at Let's Try Foods.`,
    isPartOf: { "@id": `${SITE_URL}#website` },
    breadcrumb: { "@id": `${categoryUrl}#breadcrumb` },
    mainEntity: { "@id": `${categoryUrl}#itemlist` },
    inLanguage: "en-IN",
  };

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: category.name,
    numberOfItems: products.length,
    itemListElement: products.slice(0, 30).map((p, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      url: `${SITE_URL}/product/${p.slug}`,
      name: p.name,
    })),
  };

  const faqSchema = faqBlock
    ? {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "@id": `${categoryUrl}#faq`,
      mainEntity: faqBlock.faqs.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: {
          "@type": "Answer",
          text: f.a,
        },
      })),
    }
    : null;

  // Speakable hints the answer-box paragraph and FAQ answers — these are
  // the parts AI / voice engines should consider quoting.
  const speakableSchema = faqBlock
    ? {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "@id": `${categoryUrl}#speakable`,
      url: categoryUrl,
      speakable: {
        "@type": "SpeakableSpecification",
        cssSelector: ['[data-speakable="true"]'],
      },
    }
    : null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(collectionPageSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
      {speakableSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(speakableSchema) }}
        />
      )}
      <CategoryPageContainer>
        <Breadcrumbs
          crumbs={[{ label: "Home", href: "/" }, { label: category.name }]}
        />
        <CategoryHeader
          title={category.name}
          productCount={category.productCount}
        />
        {faqBlock && <CategoryAnswerBox intro={faqBlock.intro} />}
        <ProductGrid
          products={products}
          categoryType={categoryType}
          slug={slug}
        />
        {faqBlock && (
          <CategoryFaqSection
            categoryName={category.name}
            faqs={faqBlock.faqs}
          />
        )}
      </CategoryPageContainer>
    </>
  );
}
