import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getProductBySlug } from "@/lib/product";
import { getCategoriesByIds } from "@/lib/category/get-categories-by-ids";
import { ProductPageContainer } from "@/components/product-page/ProductPageContainer";
import { ProductDetails } from "@/components/product-page/ProductDetails";
import { ProductAccordion } from "@/components/product-page/ProductAccordion";
import { InfoTable } from "@/components/product-page/InfoTable";
import { CategoryProductsSections } from "@/components/product-page/CategoryProductsSections";
import { ProductRichContent } from "@/components/product-page/ProductRichContent";
import { ProductTrustRow } from "@/components/product-page/ProductTrustRow";
import { PincodeDeliveryEstimator } from "@/components/product-page/PincodeDeliveryEstimator";
import { getCdnUrl } from "@/lib/image-utils";
import { getProductOverride } from "@/lib/seo/overrides";
import { buildProductFaqs } from "@/lib/seo/product-faqs";

export const revalidate = 1800;

const SITE_URL = (process.env.NEXT_PUBLIC_BASE_URL || 'https://letstryfoods.com').replace(/\/$/, '');

// Map pillar slugs to friendly names for breadcrumbs. As more pillars
// are added in the CMS the storefront should fetch this map at build
// time; this hardcoded fallback covers the cluster currently planned.
const PILLAR_NAMES: Record<string, string> = {
  'no-palm-oil-snacks': 'No Palm Oil Snacks',
  'palm-oil-free-namkeen': 'Palm-Oil-Free Namkeen',
  'no-maida-snacks': 'No Maida Snacks',
  'no-refined-sugar-cookies': 'No Refined Sugar Cookies',
  'healthy-vrat-snacks': 'Healthy Vrat Snacks',
  'healthy-snacks-for-kids': 'Healthy Snacks for Kids',
};

interface OfferBuildArgs {
  productUrl: string;
  currency: string;
  defaultVariant: { price?: number; mrp?: number; stockQuantity?: number; availabilityStatus?: string } | undefined;
  availableVariants?: { price?: number; sku?: string }[];
  availability: string;
  priceValidUntil: string;
  deliveryLeadTime?: string;
  siteUrl: string;
}

/**
 * Build Schema.org Offer or AggregateOffer.
 *
 * Single Offer is correct when there's only one purchasable variant.
 * AggregateOffer is correct when multiple variants have different prices
 * (the typical case for Let's Try where 100g / 200g / 500g packs differ).
 * Google rewards AggregateOffer with "from ₹X" rich result placement.
 */
function buildOfferSchema(args: OfferBuildArgs) {
  const variants = (args.availableVariants || []).filter((v) => typeof v.price === 'number');
  const seller = {
    '@type': 'Organization',
    '@id': `${args.siteUrl}#organization`,
    name: "Let's Try Foods",
  };

  if (variants.length > 1) {
    const prices = variants.map((v) => v.price as number);
    return {
      '@type': 'AggregateOffer',
      priceCurrency: args.currency,
      lowPrice: Math.min(...prices),
      highPrice: Math.max(...prices),
      offerCount: variants.length,
      availability: args.availability,
      url: args.productUrl,
      priceValidUntil: args.priceValidUntil,
      seller,
      offers: variants.map((v) => ({
        '@type': 'Offer',
        priceCurrency: args.currency,
        price: v.price,
        sku: v.sku,
        availability: args.availability,
        priceValidUntil: args.priceValidUntil,
        url: args.productUrl,
        seller,
      })),
    };
  }

  return {
    '@type': 'Offer',
    url: args.productUrl,
    priceCurrency: args.currency,
    price: args.defaultVariant?.price ?? 0,
    priceValidUntil: args.priceValidUntil,
    availability: args.availability,
    itemCondition: 'https://schema.org/NewCondition',
    ...(args.deliveryLeadTime
      ? {
          shippingDetails: {
            '@type': 'OfferShippingDetails',
            deliveryTime: {
              '@type': 'ShippingDeliveryTime',
              transitTime: { '@type': 'QuantitativeValue', minValue: 1, maxValue: 7, unitCode: 'd' },
            },
            shippingDestination: { '@type': 'DefinedRegion', addressCountry: 'IN' },
          },
          hasMerchantReturnPolicy: {
            '@type': 'MerchantReturnPolicy',
            applicableCountry: 'IN',
            returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
            merchantReturnDays: 7,
            returnMethod: 'https://schema.org/ReturnByMail',
            returnFees: 'https://schema.org/FreeReturn',
          },
        }
      : {}),
    seller,
  };
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id: slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return {
      title: "Product Not Found",
      description: "The requested product could not be found.",
    };
  }

  const seo = product.seo;
  const brand = product.brand || "Let's Try";
  const variant = product.defaultVariant;
  const pack =
    variant?.packageSize ||
    (variant?.weight && variant?.weightUnit
      ? `${variant.weight}${variant.weightUnit}`
      : null);

  // Title now bakes the universal "No Palm Oil" USP into every default
  // product title so non-CMS-edited products still rank for the highest-
  // intent keywords. Brand-claim matrix is honoured by suppressing
  // "No Maida" mentions for the rusk / Purani Delhi range.
  const titleClaims: string[] = ['No Palm Oil'];
  // Note: caller doesn't have category here so we keep the title generic;
  // category-aware claims live in the per-product CMS metaTitle override.
  const titleParts = [
    product.name,
    pack ? pack : null,
    `– ${titleClaims.join(', ')}`,
  ].filter(Boolean);
  const defaultTitle = `${titleParts.join(' ')} | Let's Try Foods`;

  const descParts: string[] = [];
  if (product.description) {
    descParts.push(product.description);
  } else {
    descParts.push(`Buy ${product.name}${pack ? ` (${pack})` : ''} online from Let's Try Foods.`);
  }
  // USP keywords always present in the default fallback so non-CMS-edited
  // products still surface them in SERP / rich results.
  descParts.push('Made without palm oil. 100% groundnut oil.');
  if (product.isVegetarian) descParts.push('100% vegetarian.');
  if (product.shelfLife) descParts.push(`Shelf life: ${product.shelfLife}.`);
  descParts.push('Shipped across India.');
  const defaultDescription = descParts.join(' ').slice(0, 300);

  const override = getProductOverride(slug);
  const finalTitle = seo?.metaTitle || override?.title || defaultTitle;
  const finalDescription = seo?.metaDescription || override?.description || defaultDescription;
  const canonical = seo?.canonicalUrl || `${SITE_URL}/product/${slug}`;

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
        : product?.defaultVariant?.images?.[0]?.url
          ? [{ url: getCdnUrl(product.defaultVariant.images[0].url) }]
          : [],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: seo?.ogTitle || finalTitle,
      description: seo?.ogDescription || finalDescription,
      images: seo?.ogImage
        ? [getCdnUrl(seo.ogImage)]
        : product?.defaultVariant?.images?.[0]?.url
          ? [getCdnUrl(product.defaultVariant.images[0].url)]
          : [],
    },
  };
}

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ProductDetailPage({
  params,
  searchParams,
}: PageProps) {
  const { id: slug } = await params;
  const { type } = await searchParams;

  const variant = type === "special" ? "special" : "default";

  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }
  const productInfo = [
    { label: "Description", value: product.description || "" },
    {
      label: "Unit",
      value:
        product.defaultVariant?.packageSize ||
        `${product.defaultVariant?.weight} ${product.defaultVariant?.weightUnit || ""}`,
    },
    { label: "Shelf life", value: product.shelfLife || "" },
    {
      label: "Diet preference",
      value: product.isVegetarian ? "Vegetarian" : "Non-Vegetarian",
    },
    {
      label: "Disclaimer",
      value:
        "Every effort is made to maintain the accuracy of all information. However, actual product packaging and materials may contain more and/or different information. It is recommended not to solely rely on the information presented.",
    },
  ];

  if (product.ingredients) {
    productInfo.splice(1, 0, {
      label: "Ingredients",
      value: product.ingredients,
    });
  }

  const categories = await getCategoriesByIds(product.categoryIds);
  const primaryCategory = categories[0];

  const breadcrumbItems = primaryCategory
    ? [
      { label: primaryCategory.name, href: `/${primaryCategory.slug}` },
      { label: product.name },
    ]
    : [{ label: product.name }];

  const productUrl = `${SITE_URL}/product/${slug}`;
  const defaultVariant = product.defaultVariant;
  const productImageEntries = (defaultVariant?.images && defaultVariant.images.length > 0
    ? defaultVariant.images
    : product.variants?.[0]?.images || []
  )
    .map((img) => ({ url: getCdnUrl(img.url), alt: img.alt || product.name }))
    .filter((entry) => Boolean(entry.url));

  const availability =
    defaultVariant?.availabilityStatus === 'in_stock' && (defaultVariant?.stockQuantity ?? 0) > 0
      ? 'https://schema.org/InStock'
      : 'https://schema.org/OutOfStock';

  // priceValidUntil is required by Google for product rich results.
  // Default to one year from the product's last update.
  const priceValidUntil = (() => {
    const base = product.updatedAt ? new Date(product.updatedAt) : new Date();
    const valid = new Date(base);
    valid.setFullYear(valid.getFullYear() + 1);
    return valid.toISOString().slice(0, 10);
  })();

  const additionalProperty = [
    product.isVegetarian
      ? { '@type': 'PropertyValue', name: 'Diet', value: 'Vegetarian' }
      : null,
    product.isGlutenFree
      ? { '@type': 'PropertyValue', name: 'Gluten-Free', value: 'Yes' }
      : null,
    product.allergens
      ? { '@type': 'PropertyValue', name: 'Allergens', value: product.allergens }
      : null,
    product.shelfLife
      ? { '@type': 'PropertyValue', name: 'Shelf life', value: product.shelfLife }
      : null,
    // Sprint 4: surface "Country of origin" / "FSSAI" so they appear in
    // shopping rich results.
    (product as { countryOfOrigin?: string }).countryOfOrigin
      ? { '@type': 'PropertyValue', name: 'Country of origin', value: (product as { countryOfOrigin?: string }).countryOfOrigin }
      : null,
    (product as { fssaiLicense?: string }).fssaiLicense
      ? { '@type': 'PropertyValue', name: 'FSSAI licence', value: (product as { fssaiLicense?: string }).fssaiLicense }
      : null,
  ].filter(Boolean);

  // Sprint 4 — additional Schema.org enrichments.
  const richProduct = product as unknown as {
    nutrition?: Record<string, string | null | undefined>;
    audience?: string[];
    pros?: { text: string }[];
    cons?: { text: string }[];
    certifications?: { name: string; number?: string | null; iconUrl?: string | null }[];
    videoUrl?: string;
    videoTitle?: string;
    videoDescription?: string;
    videoThumbnailUrl?: string;
    deliveryLeadTime?: string;
    pillarSlugs?: string[];
  };

  const nutritionInformation = richProduct.nutrition
    ? Object.fromEntries(
        Object.entries({
          '@type': 'NutritionInformation',
          servingSize: richProduct.nutrition.servingSize,
          calories: richProduct.nutrition.caloriesPerServing || richProduct.nutrition.calories,
          fatContent: richProduct.nutrition.fatContent,
          saturatedFatContent: richProduct.nutrition.saturatedFatContent,
          transFatContent: richProduct.nutrition.transFatContent,
          cholesterolContent: richProduct.nutrition.cholesterolContent,
          sodiumContent: richProduct.nutrition.sodiumContent,
          carbohydrateContent: richProduct.nutrition.carbohydrateContent,
          fiberContent: richProduct.nutrition.fiberContent,
          sugarContent: richProduct.nutrition.sugarContent,
          proteinContent: richProduct.nutrition.proteinContent,
        }).filter(([, v]) => v !== undefined && v !== null && v !== ''),
      )
    : undefined;

  const positiveNotes = richProduct.pros && richProduct.pros.length > 0
    ? {
        '@type': 'ItemList',
        itemListElement: richProduct.pros.map((p, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: p.text,
        })),
      }
    : undefined;

  const negativeNotes = richProduct.cons && richProduct.cons.length > 0
    ? {
        '@type': 'ItemList',
        itemListElement: richProduct.cons.map((p, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: p.text,
        })),
      }
    : undefined;

  const audienceSchema = richProduct.audience && richProduct.audience.length > 0
    ? richProduct.audience.map((a) => ({ '@type': 'PeopleAudience', audienceType: a }))
    : undefined;

  const awardSchema = richProduct.certifications && richProduct.certifications.length > 0
    ? richProduct.certifications.map((c) => (c.number ? `${c.name} (${c.number})` : c.name))
    : undefined;

  const videoSchema = richProduct.videoUrl
    ? {
        '@context': 'https://schema.org',
        '@type': 'VideoObject',
        '@id': `${productUrl}#video`,
        name: richProduct.videoTitle || product.name,
        description: richProduct.videoDescription || `Watch ${product.name} from Let's Try Foods.`,
        thumbnailUrl: richProduct.videoThumbnailUrl
          ? getCdnUrl(richProduct.videoThumbnailUrl)
          : productImageObjects[0]?.url,
        contentUrl: richProduct.videoUrl,
        embedUrl: richProduct.videoUrl,
        uploadDate: product.createdAt || undefined,
      }
    : null;

  const productImageObjects = productImageEntries.map((entry) => ({
    '@type': 'ImageObject',
    url: entry.url,
    caption: entry.alt,
  }));

  const productSchema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${productUrl}#product`,
    name: product.name,
    description:
      product.description ||
      `Buy ${product.name} online from Let's Try Foods. No palm oil, shipped across India.`,
    image: productImageObjects.length > 0 ? productImageObjects : undefined,
    sku: defaultVariant?.sku || undefined,
    gtin: product.gtin || undefined,
    mpn: product.mpn || undefined,
    productID: product._id,
    brand: {
      '@type': 'Brand',
      name: product.brand || "Let's Try",
    },
    manufacturer: { '@id': `${SITE_URL}#organization` },
    category: primaryCategory?.name || undefined,
    keywords:
      product.keywords && product.keywords.length > 0
        ? product.keywords.join(', ')
        : undefined,
    countryOfOrigin: 'IN',
    weight:
      defaultVariant?.weight && defaultVariant?.weightUnit
        ? {
            '@type': 'QuantitativeValue',
            value: defaultVariant.weight,
            unitText: defaultVariant.weightUnit,
          }
        : undefined,
    additionalProperty: additionalProperty.length > 0 ? additionalProperty : undefined,
    nutrition: nutritionInformation,
    audience: audienceSchema,
    award: awardSchema,
    positiveNotes,
    negativeNotes,
    // Only emit aggregateRating when real rating data exists. Empty / zero
    // ratings would be flagged as self-serving by Google and hurt rather than
    // help.
    ...(product.rating && product.ratingCount && product.ratingCount > 0
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: product.rating,
            reviewCount: product.ratingCount,
            bestRating: 5,
            worstRating: 1,
          },
        }
      : {}),
    offers: buildOfferSchema({
      productUrl,
      currency: product.currency || 'INR',
      defaultVariant,
      availableVariants: (product as { availableVariants?: typeof defaultVariant[] }).availableVariants,
      availability,
      priceValidUntil,
      deliveryLeadTime: richProduct.deliveryLeadTime,
      siteUrl: SITE_URL,
    }),
    releaseDate: product.createdAt || undefined,
    dateModified: product.updatedAt || undefined,
  };

  // Pillar-aware breadcrumbs: when the product is part of a pillar
  // (set via CMS pillarSlugs), we add it to the breadcrumb chain so
  // search engines understand the topic hierarchy.
  // Home > Pillar > Category > Product
  const primaryPillarSlug = (richProduct.pillarSlugs || [])[0];
  const primaryPillarName = primaryPillarSlug ? PILLAR_NAMES[primaryPillarSlug] : null;

  const breadcrumbSchemaItems: { name: string; item: string }[] = [
    { name: 'Home', item: SITE_URL },
  ];
  if (primaryPillarSlug && primaryPillarName) {
    breadcrumbSchemaItems.push({ name: primaryPillarName, item: `${SITE_URL}/${primaryPillarSlug}` });
  }
  if (primaryCategory) {
    breadcrumbSchemaItems.push({ name: primaryCategory.name, item: `${SITE_URL}/${primaryCategory.slug}` });
  }
  breadcrumbSchemaItems.push({ name: product.name, item: productUrl });

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbSchemaItems.map((bc, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: bc.name,
      item: bc.item,
    })),
  };

  const richProductForFaq = product as unknown as {
    audience?: string[];
    occasions?: string[];
    nutrition?: { proteinContent?: string; caloriesPerServing?: string };
    productFaqs?: { question: string; answer: string }[];
  };

  const productFaqs = buildProductFaqs({
    name: product.name,
    isVegetarian: product.isVegetarian,
    isGlutenFree: product.isGlutenFree,
    shelfLife: product.shelfLife,
    ingredients: product.ingredients,
    primaryCategorySlug: primaryCategory?.slug || null,
    primaryCategoryName: primaryCategory?.name || null,
    // Sprint 4 additions feeding the extended FAQ generator.
    audience: richProductForFaq.audience,
    occasions: richProductForFaq.occasions,
    proteinContent: richProductForFaq.nutrition?.proteinContent,
    caloriesPerServing: richProductForFaq.nutrition?.caloriesPerServing,
    cmsFaqs: richProductForFaq.productFaqs,
  });

  const faqSchema = productFaqs.length > 0
    ? {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        '@id': `${productUrl}#faq`,
        mainEntity: productFaqs.map((f) => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: {
            '@type': 'Answer',
            text: f.a,
          },
        })),
      }
    : null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
      {videoSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(videoSchema) }}
        />
      )}
      <ProductPageContainer variant={variant}>
        <ProductDetails product={product} breadcrumbItems={breadcrumbItems} />
        <div className="max-w-4xl">
          <ProductTrustRow
            isVegetarian={product.isVegetarian}
            isGlutenFree={product.isGlutenFree}
            primaryCategorySlug={primaryCategory?.slug || null}
            occasions={richProduct.occasions}
          />
          <PincodeDeliveryEstimator deliveryLeadTime={richProduct.deliveryLeadTime} />
        </div>
        <div className="mt-8">
          <ProductRichContent product={product as Parameters<typeof ProductRichContent>[0]['product']} />
        </div>
        <ProductAccordion title="Product Info">
          <InfoTable data={productInfo} />
        </ProductAccordion>
        {productFaqs.length > 0 && (
          <section
            aria-labelledby="product-faq-heading"
            className="mt-10 border-t border-gray-200 pt-8 max-w-4xl"
          >
            <h2
              id="product-faq-heading"
              className="text-2xl font-semibold text-gray-900 mb-6"
            >
              Frequently Asked Questions
            </h2>
            <div className="space-y-5">
              {productFaqs.map((f) => (
                <div key={f.q} className="border-b border-gray-200 pb-5 last:border-b-0">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                    {f.q}
                  </h3>
                  <p
                    data-speakable="true"
                    className="text-sm sm:text-base text-gray-700 leading-relaxed"
                  >
                    {f.a}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}
        <CategoryProductsSections categoryIds={product.categoryIds} />
      </ProductPageContainer>
    </>
  );
}
