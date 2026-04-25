import { getCategoryBySlug } from '@/lib/category';
import { CategoryPageContainer } from '@/components/category-page/CategoryPageContainer';
import { CategoryHeader } from '@/components/category-page/CategoryHeader';
import { CategoryAbout, CategoryFAQ } from '@/components/category-page/CategoryContent';
import { ProductGrid } from '@/components/category-page/ProductGrid';
import { Product } from '@/components/category-page/ProductCard';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getCdnUrl } from '@/lib/image-utils';
import { getCategoryOverride } from '@/lib/seo/overrides';

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
    const override = getCategoryOverride(slug);

    const defaultTitle = `${category.name} – Buy Online | Let's Try Foods`;
    const countHint = category.productCount
      ? `Choose from ${category.productCount} ${category.productCount === 1 ? 'product' : 'products'}. `
      : '';
    const defaultDescription =
      category.description ||
      `Shop ${category.name} at Let's Try Foods. ${countHint}Shipped across India.`.trim();

    const finalTitle = seo?.metaTitle || override?.title || defaultTitle;
    const finalDescription = seo?.metaDescription || override?.description || defaultDescription;
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
        images: seo?.ogImage ? [{ url: getCdnUrl(seo.ogImage) }] : category.imageUrl ? [{ url: getCdnUrl(category.imageUrl) }] : [],
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: seo?.ogTitle || finalTitle,
        description: seo?.ogDescription || finalDescription,
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
      const override = getCategoryOverride(slug);

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

      const faqSchema =
        override?.faqs && override.faqs.length > 0
          ? {
              '@context': 'https://schema.org',
              '@type': 'FAQPage',
              mainEntity: override.faqs.map((f) => ({
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
            dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
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
          <CategoryPageContainer>
            <CategoryHeader
              title={override?.h1 || category.name}
              productCount={category.productCount}
              tagline={override?.tagline}
            />
            <ProductGrid products={products} categoryType={categoryType} slug={slug} />
            <CategoryAbout
              heading={override?.aboutHeading || `About ${category.name}`}
              paragraphs={override?.about}
            />
            <CategoryFAQ faqs={override?.faqs} />
          </CategoryPageContainer>
        </>
      );
    }
  } catch (error) {
    console.error('Error fetching category:', error);
  }

  notFound();
}
