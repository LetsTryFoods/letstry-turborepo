"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface ProductGalleryProps {
  images: string[];
  isOutOfStock?: boolean;
}

export const ProductGallery: React.FC<ProductGalleryProps> = ({ images, isOutOfStock = false }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  return (
    <div className={cn("flex flex-col gap-4", isOutOfStock && "grayscale opacity-80")}>
      {/* Main Image */}
      <div className="relative w-full aspect-[4/5] bg-[#fdfbf7] rounded-3xl overflow-hidden flex items-center justify-center border border-gray-100">
        <div className="relative w-3/4 h-3/4">
             <Image
            src={images[selectedIndex]}
            alt="Product Image"
            fill
            className="object-contain"
            priority
          />
        </div>
      </div>

      {/* Thumbnails */}
      <div className="flex gap-4 overflow-x-auto pb-2">
        {images.map((img, idx) => (
          <button
            key={idx}
            onClick={() => setSelectedIndex(idx)}
            className={cn(
              "relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 bg-white p-1",
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
