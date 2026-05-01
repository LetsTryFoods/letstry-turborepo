import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getBlogBySlug, getActiveBlogs } from '@/lib/blog';
import type { Metadata } from 'next';
import { getCdnUrl } from '@/lib/image-utils';

// ISR: re-render blog posts every 30 minutes so CMS edits propagate
// without a redeploy. Aligns with category and product templates.
export const revalidate = 1800;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const blog = await getBlogBySlug(slug);

  if (!blog) {
    return {
      title: 'Blog Not Found | Let\'s Try',
    };
  }

  const seo = blog.seo;
  const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || 'https://letstryfoods.com').replace(/\/$/, '');
  const blogUrl = `${baseUrl}/blog/${blog.slug}`;
  const defaultTitle = `${blog.title} | Let's Try Foods Blog`;

  return {
    title: { absolute: seo?.metaTitle || defaultTitle },
    description: seo?.metaDescription || blog.excerpt,
    keywords: seo?.metaKeywords || [],
    alternates: {
      canonical: seo?.canonicalUrl || blogUrl,
    },
    openGraph: {
      title: seo?.ogTitle || seo?.metaTitle || blog.title,
      description: seo?.ogDescription || seo?.metaDescription || blog.excerpt,
      url: blogUrl,
      type: 'article',
      images: (seo?.ogImage || blog.image) ? [
        {
          url: (seo?.ogImage || blog.image) as string,
          width: 1200,
          height: 630,
          alt: blog.title,
        },
      ] : [],
      publishedTime: blog.date || undefined,
      authors: [blog.author],
    },
    twitter: {
      card: 'summary_large_image',
      title: seo?.ogTitle || seo?.metaTitle || blog.title,
      description: seo?.ogDescription || seo?.metaDescription || blog.excerpt,
      images: (seo?.ogImage || blog.image) ? [(seo?.ogImage || blog.image) as string] : [],
    },
  };
}

export default async function BlogDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const blog = await getBlogBySlug(slug);

  if (!blog) {
    notFound();
  }

  const allBlogs = await getActiveBlogs();
  const relatedBlogs = allBlogs
    .filter((b) => b._id !== blog._id)
    .slice(0, 3);

  const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || 'https://letstryfoods.com').replace(/\/$/, '');
  const blogUrl = `${baseUrl}/blog/${blog.slug}`;
  const blogImage = blog.seo?.ogImage || blog.image;

  // If the author looks like a brand / org name, emit Organization. Otherwise
  // assume it's a Person — Person authorship is a stronger E-E-A-T signal for
  // AI / search engines.
  const rawAuthor = (blog.author || '').trim();
  const looksLikeOrg =
    !rawAuthor ||
    /\b(team|foods?|brand|inc\.?|llc|ltd\.?|pvt|co\.?)\b/i.test(rawAuthor) ||
    rawAuthor.toLowerCase() === "let's try" ||
    rawAuthor.toLowerCase() === "let's try foods";

  const authorSchema = looksLikeOrg
    ? {
        '@type': 'Organization',
        '@id': `${baseUrl}#organization`,
        name: rawAuthor || "Let's Try Foods",
      }
    : {
        '@type': 'Person',
        name: rawAuthor,
        worksFor: { '@id': `${baseUrl}#organization` },
      };

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    '@id': `${blogUrl}#article`,
    mainEntityOfPage: { '@type': 'WebPage', '@id': blogUrl },
    headline: blog.title,
    description: blog.excerpt,
    image: blogImage ? [getCdnUrl(blogImage)] : undefined,
    author: authorSchema,
    publisher: { '@id': `${baseUrl}#organization` },
    datePublished: blog.date || blog.createdAt,
    dateModified: blog.updatedAt || blog.date || blog.createdAt,
    articleSection: blog.category || undefined,
    inLanguage: 'en-IN',
    isPartOf: { '@id': `${baseUrl}#website` },
  };

  // Speakable: mark headline + intro/excerpt area as candidates for voice / AI
  // quoting on the article page.
  const speakableSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${blogUrl}#speakable`,
    url: blogUrl,
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['h1', '[data-speakable="true"]'],
    },
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: baseUrl },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: `${baseUrl}/blog` },
      { '@type': 'ListItem', position: 3, name: blog.title, item: blogUrl },
    ],
  };

  return (
    <main className="min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(speakableSchema) }}
      />
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <nav className="mb-8">
          <Link
            href="/blog"
            className="inline-flex items-center text-teal-700 hover:text-teal-800 font-medium"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Blog
          </Link>
        </nav>

        <div className="mb-8">
          <div className="inline-block bg-gray-100 text-gray-700 text-sm px-3 py-1 rounded mb-4">
            {blog.date}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {blog.title}
          </h1>
          <div className="flex items-center text-gray-600 text-sm">
            <span>By {blog.author}</span>
            <span className="mx-2">•</span>
            <span>{blog.category}</span>
          </div>
        </div>

        {blog.image && (
          <div className="relative h-96 mb-8 rounded-lg overflow-hidden bg-gray-100">
            <Image
              src={getCdnUrl(blog.image)}
              alt={blog.title}
              fill
              className="object-cover"
            />
          </div>
        )}

        <div
          className="prose prose-lg max-w-none mb-12"
          dangerouslySetInnerHTML={{ __html: blog.content }}
        />

        <div className="border-t border-gray-200 pt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Related Articles
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedBlogs.map((relatedBlog) => (
              <Link
                key={relatedBlog._id}
                href={`/blog/${relatedBlog.slug}`}
                className="group"
              >
                <article className="bg-white rounded-lg overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow">
                  <div className="relative h-40 bg-gray-100">
                    {relatedBlog.image ? (
                      <Image
                        src={getCdnUrl(relatedBlog.image)}
                        alt={relatedBlog.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="text-xs text-gray-500 mb-2">
                      {relatedBlog.date}
                    </div>
                    <h3 className="text-base font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-teal-700">
                      {relatedBlog.title}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {relatedBlog.excerpt}
                    </p>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </div>
      </article>
    </main>
  );
}
