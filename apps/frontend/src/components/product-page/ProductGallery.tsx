"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ProductGalleryProps {
  images: string[];
  isOutOfStock?: boolean;
}

export const ProductGallery: React.FC<ProductGalleryProps> = ({ images, isOutOfStock = false }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();

  return (
    <div className={cn("flex flex-col gap-4", isOutOfStock && "grayscale opacity-80")}>
      <div className="relative w-full aspect-[4/5] bg-[#fdfbf7] rounded-3xl overflow-hidden flex items-center justify-center border border-gray-100">
        <button 
          onClick={() => router.back()} 
          className="absolute top-4 left-4 z-10 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-gray-50"
        >
          <ChevronLeft size={24} className="text-black" />
        </button>
        
        <div className="relative w-full h-full p-2 sm:p-4 md:p-6">
             <Image
            src={images[selectedIndex]}
            alt="Product Image"
            fill
            className="object-contain"
            priority
          />
        </div>
      </div>

      <div className="flex gap-2 sm:gap-3 md:gap-4 overflow-x-auto pb-2">
        {images.map((img, idx) => (
          <button
            key={idx}
            onClick={() => setSelectedIndex(idx)}
            className={cn(
              "relative w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 flex-shrink-0 rounded-md sm:rounded-lg overflow-hidden border-2 bg-white p-0.5 sm:p-1",
              selectedIndex === idx ? "border-blue-900" : "border-gray-200"
            )}
          >
            <div className="relative w-full h-full">
                <Image
                src={img}
                alt={`Thumbnail ${idx + 1}`}
                fill
                className="object-contain"
                />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};