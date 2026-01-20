'use client';

import { Suspense, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronLeft, Search } from 'lucide-react';
import { useSearchProducts } from '@/lib/search/use-search';
import { ProductCard, type Product } from '@/components/category-page/ProductCard';
import { useDebounce } from '@/hooks/use-debounce';

const POPULAR_SEARCHES = ['Makhana', 'Chips', 'Bhujia', 'Snacks', 'Dry Fruits', 'Cookies'];

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

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchTerm = searchParams.get('q') || '';
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const { data, isLoading } = useSearchProducts(debouncedSearchTerm);

//   const handlePopularSearch = useCallback((term: string) => {
//     router.push(`/search?q=${encodeURIComponent(term)}`);
//   }, [router]);

  const products = data?.searchProducts?.items?.map(mapProductData) || [];
  const meta = data?.searchProducts?.meta;
  const hasSearched = debouncedSearchTerm.trim().length > 0;

  return (
    <div className="min-h-screen bg-white">
      {/* <div className="md:hidden sticky top-0 z-10 bg-white border-b border-gray-100">
        <div className="flex items-center gap-3 p-4">
          <button onClick={() => router.back()} className="p-1" aria-label="Go back">
            <ChevronLeft size={24} className="text-black" />
          </button>
        </div>
      </div> */}

      
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        {/* {!hasSearched && (
          <div className="mb-8">
            <h3 className="text-xl md:text-2xl font-bold text-black mb-4">
              Popular Searches
            </h3>
            <div className="flex flex-wrap gap-3">
              {POPULAR_SEARCHES.map((item) => (
                <button
                  key={item}
                  className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-300 hover:bg-gray-50 transition-colors"
                  onClick={() => handlePopularSearch(item)}
                >
                  <Search size={16} className="text-gray-400" />
                  <span className="text-sm md:text-base font-medium text-black">
                    {item}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )} */}

        {isLoading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
            <p className="mt-4 text-gray-600">Searching...</p>
          </div>
        )}

        {!isLoading && products.length === 0 && hasSearched && (
          <div className="text-center py-12">
            <p className="text-lg text-gray-600">
              No products found for &quot;{debouncedSearchTerm}&quot;
            </p>
          </div>
        )}

        {!isLoading && products.length > 0 && (
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg md:text-xl lg:text-2xl font-bold text-black">
                {hasSearched ? 'Search Results' : 'All Products'}
              </h3>
              <p className="text-sm md:text-base text-gray-600">
                {meta?.totalCount || 0} {meta?.totalCount === 1 ? 'product' : 'products'}
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8 lg:gap-10">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto p-4 md:p-6">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
