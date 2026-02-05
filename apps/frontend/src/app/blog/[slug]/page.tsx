import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getBlogBySlug, getActiveBlogs } from '@/lib/blog';
import type { Metadata } from 'next';

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

  return {
    title: `${blog.title} | Let's Try Blog`,
    description: blog.excerpt,
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

  return (
    <main className="min-h-screen bg-white">
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
              src={blog.image}
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
                        src={relatedBlog.image}
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
