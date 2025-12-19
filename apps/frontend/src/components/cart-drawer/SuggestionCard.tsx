import React from 'react';
import Image from 'next/image';

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
    <div className="min-w-[140px] w-[140px] border border-gray-200 rounded-xl p-3 flex flex-col bg-white">
      <div className="relative w-full h-24 bg-gray-50 rounded-lg mb-3 overflow-hidden">
        <Image
          src="https://d11a0m43ek7ap8.cloudfront.net/8bbbe150d5da51d6950bd2b576696a63.webp"
          alt={title}
          fill
          className="object-contain p-2"
        />
      </div>
      
      <h4 className="text-sm font-medium text-gray-900 line-clamp-2 h-10 mb-1 text-center">
        {title}
      </h4>
      
      <p className="text-sm font-bold text-gray-900 text-center mb-3">
        ₹ {price}
      </p>
      
      <button
        onClick={() => onAdd(id)}
        className="w-full py-1.5 px-3 border border-[#0F4A6A] text-[#0F4A6A] text-xs font-semibold rounded-lg hover:bg-[#0F4A6A] hover:text-white transition-colors"
      >
        Add to cart
      </button>
    </div>
  );
};
