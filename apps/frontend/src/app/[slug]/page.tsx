import { getCategoryBySlug } from '@/lib/category';
import { CategoryPageContainer } from '@/components/category-page/CategoryPageContainer';
import { CategoryHeader } from '@/components/category-page/CategoryHeader';
import { ProductGrid } from '@/components/category-page/ProductGrid';
import { Product } from '@/components/category-page/ProductCard';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getCdnUrl } from '@/lib/image-utils';

export const revalidate = 1800;

const SITE_URL = (process.env.NEXT_PUBLIC_BASE_URL || 'https://letstryfoods.com').replace(/\/$/, '');

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;

  const category = await getCategoryBySlug(slug);
  if (category) {
    const seo = category.seo;
    const defaultTitle = `${category.name} – Buy Online | Let's Try Foods`;
    const countHint = category.productCount
      ? `Choose from ${category.productCount} ${category.productCount === 1 ? 'product' : 'products'}. `
      : '';
    const defaultDescription =
      category.description ||
      `Shop ${category.name} at Let's Try Foods. ${countHint}Shipped across India.`.trim();
    const canonical = seo?.canonicalUrl || `${SITE_URL}/${slug}`;

    return {
      title: { absolute: seo?.metaTitle || defaultTitle },
      description: seo?.metaDescription || defaultDescription,
      keywords: seo?.metaKeywords || [],
      alternates: {
        canonical,
      },
      openGraph: {
        title: seo?.ogTitle || seo?.metaTitle || defaultTitle,
        description: seo?.ogDescription || seo?.metaDescription || defaultDescription,
        url: canonical,
        images: seo?.ogImage ? [{ url: getCdnUrl(seo.ogImage) }] : category.imageUrl ? [{ url: getCdnUrl(category.imageUrl) }] : [],
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: seo?.ogTitle || seo?.metaTitle || defaultTitle,
        description: seo?.ogDescription || seo?.metaDescription || defaultDescription,
        images: seo?.ogImage ? [getCdnUrl(seo.ogImage)] : category.imageUrl ? [getCdnUrl(category.imageUrl)] : [],
      },
    };
  }

  return {
    title: 'Page Not Found | Letstry',
    description: 'The requested page could not be found.',
  };
}

function mapProductData(apiProduct: any): Product {
  const defaultVariant = apiProduct.defaultVariant;
  const variants = apiProduct.availableVariants?.map((v: any) => ({
    id: v._id,
    weight: v.packageSize || `${v.weight}${v.weightUnit}`,
    price: v.price,
    mrp: v.mrp,
  })) || [];

  if (variants.length === 0 && defaultVariant) {
    variants.push({
      id: defaultVariant._id || apiProduct._id,
      weight: defaultVariant.packageSize || 'Standard',
      price: defaultVariant.price,
      mrp: defaultVariant.mrp,
    });
  }

  const tags = apiProduct.tags || [];
  let badge = undefined;

  if (tags.includes('trending')) {
    badge = { label: 'Trending', variant: 'trending' as const };
  } else if (tags.includes('bestseller')) {
    badge = { label: 'Bestseller', variant: 'bestseller' as const };
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

export default async function DynamicSlugPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { type } = await searchParams;

  try {
    const category = await getCategoryBySlug(slug);
    if (category) {
      const categoryType = type === 'special' ? 'special' : 'default';
      const products = category.products.map(mapProductData);
      const categoryUrl = `${SITE_URL}/${slug}`;

      const breadcrumbSchema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
          { '@type': 'ListItem', position: 2, name: category.name, item: categoryUrl },
        ],
      };

      const itemListSchema = {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: category.name,
        numberOfItems: products.length,
        itemListElement: products.slice(0, 30).map((p, idx) => ({
          '@type': 'ListItem',
          position: idx + 1,
          url: `${SITE_URL}/product/${p.slug}`,
          name: p.name,
        })),
      };

      return (
        <>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
          />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
          />
          <CategoryPageContainer>
            <CategoryHeader title={category.name} productCount={category.productCount} />
            <ProductGrid products={products} categoryType={categoryType} slug={slug} />
          </CategoryPageContainer>
        </>
      );
    }
  } catch (error) {
    console.error('Error fetching category:', error);
  }

  notFound();
}
