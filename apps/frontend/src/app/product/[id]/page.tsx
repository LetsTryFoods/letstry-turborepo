import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getProductBySlug } from "@/lib/product";
import { getCategoriesByIds } from "@/lib/category/get-categories-by-ids";
import { ProductPageContainer } from "@/components/product-page/ProductPageContainer";
import { ProductDetails } from "@/components/product-page/ProductDetails";
import { ProductAccordion } from "@/components/product-page/ProductAccordion";
import { InfoTable } from "@/components/product-page/InfoTable";
import { CategoryProductsSections } from "@/components/product-page/CategoryProductsSections";
import { getCdnUrl } from "@/lib/image-utils";
import { getProductOverride } from "@/lib/seo/overrides";
import { buildProductFaqs } from "@/lib/seo/product-faqs";

export const revalidate = 1800;

const SITE_URL = (process.env.NEXT_PUBLIC_BASE_URL || 'https://letstryfoods.com').replace(/\/$/, '');

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

  const titleParts = [product.name, pack ? `(${pack})` : null].filter(Boolean);
  const defaultTitle = `${titleParts.join(' ')} | ${brand} | Let's Try Foods`;

  const descParts: string[] = [];
  if (product.description) {
    descParts.push(product.description);
  } else {
    descParts.push(`Buy ${product.name}${pack ? ` (${pack})` : ''} online from Let's Try Foods.`);
  }
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
  ].filter(Boolean);

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
    offers: {
      '@type': 'Offer',
      url: productUrl,
      priceCurrency: product.currency || 'INR',
      price: defaultVariant?.price ?? 0,
      priceValidUntil,
      availability,
      itemCondition: 'https://schema.org/NewCondition',
      seller: {
        '@type': 'Organization',
        '@id': `${SITE_URL}#organization`,
        name: "Let's Try Foods",
      },
    },
    releaseDate: product.createdAt || undefined,
    dateModified: product.updatedAt || undefined,
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: SITE_URL,
      },
      ...(primaryCategory
        ? [{
          '@type': 'ListItem',
          position: 2,
          name: primaryCategory.name,
          item: `${SITE_URL}/${primaryCategory.slug}`,
        }]
        : []),
      {
        '@type': 'ListItem',
        position: primaryCategory ? 3 : 2,
        name: product.name,
        item: productUrl,
      },
    ],
  };

  const productFaqs = buildProductFaqs({
    name: product.name,
    isVegetarian: product.isVegetarian,
    isGlutenFree: product.isGlutenFree,
    shelfLife: product.shelfLife,
    ingredients: product.ingredients,
    primaryCategorySlug: primaryCategory?.slug || null,
    primaryCategoryName: primaryCategory?.name || null,
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
      <ProductPageContainer variant={variant}>
        <ProductDetails product={product} breadcrumbItems={breadcrumbItems} />
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
