import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getLandingPageBySlug, getActiveLandingPages, getProductsBySlugList } from '@/lib/landing-page';
import { SectionRenderer } from '@/components/landing-page/SectionRenderer';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const pages = await getActiveLandingPages();
  return pages.map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = await getLandingPageBySlug(slug);

  if (!page) {
    return { title: "Not Found | Let's Try" };
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://letstry.com';
  const pageUrl = `${baseUrl}/landing/${page.slug}`;
  const seo = page.seo;

  return {
    title: seo?.metaTitle || `${page.title} | Let's Try`,
    description: seo?.metaDescription || page.description || '',
    keywords: seo?.metaKeywords || [],
    alternates: {
      canonical: seo?.canonicalUrl || pageUrl,
    },
    openGraph: {
      title: seo?.ogTitle || seo?.metaTitle || page.title,
      description: seo?.ogDescription || seo?.metaDescription || page.description || '',
      url: pageUrl,
      images: (seo?.ogImage || page.thumbnailUrl)
        ? [{ url: (seo?.ogImage || page.thumbnailUrl) as string, width: 1200, height: 630, alt: page.title }]
        : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: seo?.ogTitle || seo?.metaTitle || page.title,
      description: seo?.ogDescription || seo?.metaDescription || page.description || '',
      images: (seo?.ogImage || page.thumbnailUrl) ? [(seo?.ogImage || page.thumbnailUrl) as string] : [],
    },
  };
}

export default async function LandingDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const page = await getLandingPageBySlug(slug);

  if (!page) {
    notFound();
  }

  const activeSections = page.sections
    .filter((s) => s.isActive)
    .sort((a, b) => a.position - b.position);

  const allProductSlugs = activeSections
    .filter((s) => s.type === 'products' && s.productSlugs?.length)
    .flatMap((s) => s.productSlugs);

  const products = await getProductsBySlugList(allProductSlugs);

  const tocSections = activeSections.filter((s) =>
    ['hero', 'content', 'products', 'faq'].includes(s.type)
  );

  return (
    <main>
      {activeSections.map((section, index) => (
        <SectionRenderer
          key={index}
          section={section}
          products={products}
          tocSections={tocSections}
        />
      ))}
    </main>
  );
}
