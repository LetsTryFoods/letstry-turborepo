import React from 'react';
import { ChevronRight } from 'lucide-react';
import Image from 'next/image';

interface CategoryLinkProps {
  categoryName: string;
  iconUrl?: string;
}

export const CategoryLink: React.FC<CategoryLinkProps> = ({ categoryName, iconUrl }) => {
  return (
    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer group mb-8">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-blue-50 rounded-md flex items-center justify-center overflow-hidden">
            {/* Placeholder icon if no url */}
            {iconUrl ? (
                 <Image src={iconUrl} alt={categoryName} width={32} height={32} className="object-contain" />
            ) : (
                <div className="w-6 h-6 bg-blue-200 rounded-full" />
            )}
        </div>
        <div className="flex flex-col text-left">
          <span className="font-bold text-gray-900">{categoryName}</span>
          <span className="text-xs text-blue-600 font-medium group-hover:underline">Explore all products</span>
        </div>
      </div>
      <ChevronRight className="w-5 h-5 text-gray-400" />
    </div>
  );
};
