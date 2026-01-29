import { getCategoryBySlug } from '@/lib/category';
import { CategoryPageContainer } from '@/components/category-page/CategoryPageContainer';
import { CategoryHeader } from '@/components/category-page/CategoryHeader';
import { ProductGrid } from '@/components/category-page/ProductGrid';
import { Product } from '@/components/category-page/ProductCard';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

export const revalidate = 1800;

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;

  const category = await getCategoryBySlug(slug);
  if (category) {
    const seo = category.seo;
    const defaultTitle = `${category.name} | Letstry`;
    const defaultDescription = category.description || `Shop ${category.name} products at Letstry. Browse our collection of premium quality items.`;

    return {
      title: seo?.metaTitle || defaultTitle,
      description: seo?.metaDescription || defaultDescription,
      keywords: seo?.metaKeywords || [],
      alternates: {
        canonical: seo?.canonicalUrl || undefined,
      },
      openGraph: {
        title: seo?.ogTitle || seo?.metaTitle || defaultTitle,
        description: seo?.ogDescription || seo?.metaDescription || defaultDescription,
        images: seo?.ogImage ? [{ url: seo.ogImage }] : category.imageUrl ? [{ url: category.imageUrl }] : [],
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: seo?.ogTitle || seo?.metaTitle || defaultTitle,
        description: seo?.ogDescription || seo?.metaDescription || defaultDescription,
        images: seo?.ogImage ? [seo.ogImage] : category.imageUrl ? [category.imageUrl] : [],
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
    image: defaultVariant?.thumbnailUrl || apiProduct.thumbnailUrl,
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

      return (
        <CategoryPageContainer>
          <CategoryHeader title={category.name} productCount={category.productCount} />
          <ProductGrid products={products} categoryType={categoryType} slug={slug} />
        </CategoryPageContainer>
      );
    }
  } catch (error) {
    console.error('Error fetching category:', error);
  }

  notFound();
}
