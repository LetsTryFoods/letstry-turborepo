"use client";

import Link from 'next/link';
import Image from 'next/image';
import type { Category } from '@/types/category.types';

export interface CategoryCardProps {
  category: Category;
}

export const CategoryCard = ({ category }: CategoryCardProps) => {
  return (
    <article className="flex flex-col items-center text-center">
      <Link href={category.href} className="group w-full">
      {/* category-blob */}
        <div className="relative mx-auto w-full aspect-square flex items-center justify-center mb-1 sm:mb-2 md:mb-3">
          <div className="relative w-full h-full">
            <Image
              src={category.imageUrl}
              alt={category.name}
              fill
              className="object-contain group-hover:scale-110 transition-transform duration-300"
              unoptimized
            />
          </div>
        </div>
        <h3 className=" text-[11px] leading-tight sm:text-sm font-semibold text-gray-900 group-hover:text-brand-hover transition-colors line-clamp-2">
          {category.name}
        </h3>
      </Link>
    </article>
  );
};

export default CategoryCard;