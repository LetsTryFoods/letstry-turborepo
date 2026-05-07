import { getActiveBlogs } from '@/lib/blog';
import type { Metadata } from 'next';
import BlogGrid from './BlogGrid';

const SITE_URL = (process.env.NEXT_PUBLIC_BASE_URL || 'https://letstryfoods.com').replace(/\/$/, '');

const TITLE = "Blog – Stories of Good Food and Better Choices | Let's Try Foods";
const DESCRIPTION =
  'Discover healthy eating tips, nutritional advice, and stories about making better food choices for you and your family.';

/**
 * Metadata is generated per-request so we can add `robots: noindex` when
 * there are zero published blog posts. Indexable empty pages hurt site
 * quality signals; once the CMS has at least one active blog the page
 * becomes indexable automatically.
 *
 * Also adds canonical + og:* + twitter:* metadata that the previous
 * static export was missing — this route was the only public storefront
 * page bypassing the standard metadata builder.
 */
export async function generateMetadata(): Promise<Metadata> {
  const blogs = await getActiveBlogs();
  const hasContent = blogs.length > 0;

  return {
    title: { absolute: TITLE },
    description: DESCRIPTION,
    alternates: { canonical: `${SITE_URL}/blog` },
    openGraph: {
      title: TITLE,
      description: DESCRIPTION,
      url: `${SITE_URL}/blog`,
      type: 'website',
      siteName: "Let's Try Foods",
    },
    twitter: {
      card: 'summary_large_image',
      title: TITLE,
      description: DESCRIPTION,
    },
    robots: hasContent ? undefined : { index: false, follow: true },
  };
}

export default async function BlogPage() {
  const blogs = await getActiveBlogs();

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-12">
          Stories of Good Food and Better Choices
        </h1>

        <BlogGrid blogs={blogs} />
      </div>
    </main>
  );
}
