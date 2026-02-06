import { getActiveBlogs } from '@/lib/blog';
import type { Metadata } from 'next';
import BlogGrid from './BlogGrid';

export const metadata: Metadata = {
  title: 'Blog - Stories of Good Food and Better Choices | Let\'s Try',
  description: 'Discover healthy eating tips, nutritional advice, and stories about making better food choices for you and your family.',
};

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
