import { getActiveLandingPages } from '@/lib/landing-page';
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { getCdnUrl } from '@/lib/image-utils';

export const metadata: Metadata = {
  title: "Landing Pages | Let's Try",
  description: "Explore our curated landing pages.",
};

export default async function LandingListPage() {
  const pages = await getActiveLandingPages();

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-12">
          Landing Pages
        </h1>

        {pages.length === 0 ? (
          <p className="text-gray-500 text-center py-20">No landing pages available.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {pages.map((page) => (
              <Link
                key={page._id}
                href={`/landing/${page.slug}`}
                className="group block rounded-2xl overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow duration-300"
              >
                {getCdnUrl(page.thumbnailUrl) ? (
                  <div className="relative h-48 w-full">
                    <Image
                      src={getCdnUrl(page.thumbnailUrl)}
                      alt={page.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  </div>
                ) : (
                  <div className="h-48 w-full bg-gradient-to-br from-[#0C5273] to-[#23a6d5]" />
                )}
                <div className="p-5">
                  <h2 className="text-lg font-semibold text-gray-900 group-hover:text-[#0C5273] transition-colors">
                    {page.title}
                  </h2>
                  {page.description && (
                    <p className="mt-2 text-sm text-gray-600 line-clamp-2">{page.description}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
