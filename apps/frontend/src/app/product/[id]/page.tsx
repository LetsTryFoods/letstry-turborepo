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

  const canonical = seo?.canonicalUrl || `${SITE_URL}/product/${slug}`;

  return {
    title: { absolute: seo?.metaTitle || defaultTitle },
    description: seo?.metaDescription || defaultDescription,
    keywords: seo?.metaKeywords || [],
    alternates: {
      canonical,
    },
    openGraph: {
      title: seo?.ogTitle || seo?.metaTitle || defaultTitle,
      description:
        seo?.ogDescription || seo?.metaDescription || defaultDescription,
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
      title: seo?.ogTitle || seo?.metaTitle || defaultTitle,
      description:
        seo?.ogDescription || seo?.metaDescription || defaultDescription,
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
  const productImages = (defaultVariant?.images && defaultVariant.images.length > 0
    ? defaultVariant.images
    : product.variants?.[0]?.images || []
  ).map((img) => getCdnUrl(img.url)).filter(Boolean);

  const availability =
    defaultVariant?.availabilityStatus === 'in_stock' && (defaultVariant?.stockQuantity ?? 0) > 0
      ? 'https://schema.org/InStock'
      : 'https://schema.org/OutOfStock';

  const productSchema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description || `Buy ${product.name} online from Let's Try Foods.`,
    image: productImages.length > 0 ? productImages : undefined,
    sku: defaultVariant?.sku || undefined,
    brand: {
      '@type': 'Brand',
      name: product.brand || "Let's Try",
    },
    category: primaryCategory?.name || undefined,
    offers: {
      '@type': 'Offer',
      url: productUrl,
      priceCurrency: product.currency || 'INR',
      price: defaultVariant?.price ?? 0,
      availability,
      itemCondition: 'https://schema.org/NewCondition',
      seller: {
        '@type': 'Organization',
        name: "Let's Try Foods",
      },
    },
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
      <ProductPageContainer variant={variant}>
        <ProductDetails product={product} breadcrumbItems={breadcrumbItems} />
        <ProductAccordion title="Product Info">
          <InfoTable data={productInfo} />
        </ProductAccordion>
        <CategoryProductsSections categoryIds={product.categoryIds} />
      </ProductPageContainer>
    </>
  );
}
