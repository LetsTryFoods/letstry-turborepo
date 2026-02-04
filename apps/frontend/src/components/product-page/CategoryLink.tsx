import React from 'react';
import { ChevronRight } from 'lucide-react';
import Image from 'next/image';
import { getCdnUrl } from '@/lib/image-utils';

interface CategoryLinkProps {
  categoryName: string;
  iconUrl?: string;
}

export const CategoryLink: React.FC<CategoryLinkProps> = ({ categoryName, iconUrl }) => {
  return (
    <div className="flex items-center justify-between p-2 sm:p-3 md:p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer group mb-3 sm:mb-4 md:mb-6 lg:mb-8">
      <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
        <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-blue-50 rounded-md flex items-center justify-center overflow-hidden">
          {iconUrl ? (
            <Image src={getCdnUrl(iconUrl)} alt={categoryName} width={32} height={32} className="object-contain" />
          ) : (
            <div className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 bg-blue-200 rounded-full" />
          )}
        </div>
        <div className="flex flex-col text-left">
          <span className="text-sm sm:text-base font-bold text-gray-900">{categoryName}</span>
          <span className="text-[10px] sm:text-xs text-blue-600 font-medium group-hover:underline">Explore all products</span>
        </div>
      </div>
      <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
    </div>
  );
};
