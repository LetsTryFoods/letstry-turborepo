"use client";

import Link from 'next/link';
import Image from 'next/image';
import type { Category } from '@/types/category.types';

export interface CategoryCardProps {
  category: Category;
}

export const CategoryCard = ({ category }: CategoryCardProps) => {
  return (
    <article className="flex flex-col items-center gap-3 text-center">
      <Link href={category.href} className="group">
        <div className="relative mx-auto w-28 h-28 sm:w-36 sm:h-36 md:w-40 md:h-40 rounded-xl overflow-hidden p-2 ">
          <div className="absolute inset-0 rounded-xl" />
          <Image
            src={category.imageUrl}
            alt={category.name}
            fill
            className="object-contain"
            unoptimized
          />
        </div>
        <h3 className="mt-3 text-sm sm:text-base font-medium text-gray-900 group-hover:text-brand-hover transition-colors">
          {category.name}
        </h3>
      </Link>
    </article>
  );
};

export default CategoryCard;