"use client";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import { CategoryProductCard } from "./CategoryProductCard";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Product {
  _id: string;
  name: string;
  slug: string;
  defaultVariant?: {
    discountPercent: number;
    price: number;
    mrp: number;
    thumbnailUrl: string;
    packageSize: string;
  } | null;
}

interface CategoryProductSectionProps {
  categoryName: string;
  categorySlug: string;
  products: Product[];
}

export const CategoryProductSection: React.FC<CategoryProductSectionProps> = ({
  categoryName,
  categorySlug,
  products,
}) => {
  if (!products || products.length === 0) {
    return null;
  }

  const sanitizedBase = categoryName.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
  const prevId = `swiper-prev-${sanitizedBase}`;
  const nextId = `swiper-next-${sanitizedBase}`;

  return (
    <section className="mt-8 sm:mt-10 md:mt-12 group/section">
      <div className="flex items-center justify-between mb-4 sm:mb-6 px-1">
        <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
          {categoryName}
        </h2>
        <Link
          href={`/${categorySlug}`}
          className="text-sm sm:text-base text-brand-hover font-medium flex items-center gap-1"
        >
          <span className="hover:underline">View All</span>
        </Link>
      </div>

      <div className="relative px-1">
        <Swiper
          modules={[Navigation]}
          navigation={{
            prevEl: `.${prevId}`,
            nextEl: `.${nextId}`,
          }}
          spaceBetween={12}
          slidesPerView={2}
          breakpoints={{
            640: { slidesPerView: 3, spaceBetween: 16 },
            768: { slidesPerView: 4, spaceBetween: 20 },
            1024: { slidesPerView: 5, spaceBetween: 24 },
          }}
          className="!pb-4"
        >
          {products.slice(0, 10).map((product) => (
            <SwiperSlide key={product._id} className="h-auto">
              <CategoryProductCard product={product} categorySlug={categorySlug} />
            </SwiperSlide>
          ))}
        </Swiper>

        <button
          className={`${prevId} absolute left-[-10px] sm:left-[-20px] top-1/2 -translate-y-1/2 z-10 size-8 sm:size-10 md:size-12 rounded-full bg-white flex items-center justify-center shadow-[0_4px_10px_rgba(0,0,0,0.15)] transition-all cursor-pointer hover:bg-gray-50 border border-gray-100 disabled:opacity-0`}
        >
          <ChevronLeft className="size-5 sm:size-6 text-black" />
        </button>
        <button
          className={`${nextId} absolute right-[-10px] sm:right-[-20px] top-1/2 -translate-y-1/2 z-10 size-8 sm:size-10 md:size-12 rounded-full bg-white flex items-center justify-center shadow-[0_4px_10px_rgba(0,0,0,0.15)] transition-all cursor-pointer hover:bg-gray-50 border border-gray-100 disabled:opacity-0`}
        >
          <ChevronRight className="size-5 sm:size-6 text-black" />
        </button>
      </div>
    </section>
  );
};
