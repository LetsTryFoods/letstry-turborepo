"use client";
import { ChevronLeft } from "lucide-react";
import React from "react";
import { useRouter } from "next/navigation";

interface CategoryHeaderProps {
  title: string;
  productCount: number;
  /** Optional one-line tagline shown directly under the H1 (Sprint 1c). */
  tagline?: string;
}

export const CategoryHeader: React.FC<CategoryHeaderProps> = ({
  title,
  productCount,
  tagline,
}) => {
  const router = useRouter();

  return (
    <div className="mb-4 sm:mb-6 md:mb-8">
      <div className="flex flex-row justify-between items-start gap-3">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-black mb-1 sm:mb-2 flex items-center gap-1">
          <span>
            <ChevronLeft
              className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 text-black cursor-pointer hover:text-gray-700 transition-colors"
              onClick={() => router.back()}
            />
          </span>
          {title}
        </h1>
        <p className="text-gray-600 text-sm sm:text-base md:text-lg whitespace-nowrap pt-1">
          {productCount} products
        </p>
      </div>
      {tagline && (
        <p className="text-sm sm:text-base md:text-lg text-gray-700 mt-1 sm:mt-2 max-w-3xl leading-relaxed">
          {tagline}
        </p>
      )}
    </div>
  );
};
