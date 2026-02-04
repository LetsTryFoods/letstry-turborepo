import React from 'react';
import Image from 'next/image';
import { getCdnUrl } from '@/lib/image-utils';

interface SuggestionCardProps {
  id: string;
  image: string;
  title: string;
  price: number;
  onAdd: (id: string) => void;
}

export const SuggestionCard: React.FC<SuggestionCardProps> = ({
  id,
  image,
  title,
  price,
  onAdd,
}) => {
  return (
    <div className="min-w-[160px] w-[160px] border border-gray-100 rounded-xl p-4 flex flex-col bg-white shadow-sm">
      <div className="relative w-full h-28 bg-gray-50 rounded-lg mb-3 overflow-hidden">
        <Image
          src={getCdnUrl(image)}
          alt={title}
          fill
          className="object-contain p-2"
        />
      </div>

      <h4 className="text-sm font-bold text-black line-clamp-2 h-10 mb-2 text-center">
        {title}
      </h4>

      <p className="text-base font-bold text-black text-center mb-4">
        ₹ {price}
      </p>

      <button
        onClick={() => onAdd(id)}
        className="w-full py-2 px-3 border border-[#003B65] text-[#003B65] text-sm font-bold rounded-md hover:bg-[#003B65] hover:text-white transition-all"
      >
        Add to cart
      </button>
    </div>
  );
};
