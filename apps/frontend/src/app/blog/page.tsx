import Link from 'next/link';
import Image from 'next/image';
import { getAllBlogs } from '@/lib/blog/blog-data';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog - Stories of Good Food and Better Choices | Let\'s Try',
  description: 'Discover healthy eating tips, nutritional advice, and stories about making better food choices for you and your family.',
};

export default function BlogPage() {
  const blogs = getAllBlogs();

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-12">
          Stories of Good Food and Better Choices
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 ">
          {blogs.map((blog) => (
            <article
              key={blog.id}
              className="bg-white rounded-lg overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow"
            >
              <div className="relative h-48 bg-gray-100">
                <Image
                  src={blog.image}
                  alt={blog.title}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="p-6">
                <div className="inline-block bg-gray-100 text-gray-700 text-sm px-3 py-1 rounded mb-4">
                  {blog.date}
                </div>

                <h2 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2">
                  {blog.title}
                </h2>

                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {blog.excerpt}
                </p>

                <Link
                  href={`/blog/${blog.slug}`}
                  className="inline-flex items-center text-teal-700 hover:text-teal-800 font-medium text-sm"
                >
                  Read More
                  <svg
                    className="w-4 h-4 ml-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </Link>
              </div>
            </article>
          ))}
        </div>

        <div className="flex justify-center">
          <button className="border-2 border-teal-700 text-teal-700 hover:bg-teal-50 font-medium px-8 py-3 rounded-lg transition-colors inline-flex items-center">
            View more articles
            <svg
              className="w-4 h-4 ml-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      </div>
    </main>
  );
}
