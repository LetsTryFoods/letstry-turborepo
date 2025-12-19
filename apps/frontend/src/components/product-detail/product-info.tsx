"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';

interface DietIcon {
  type: string;
  label: string;
}

interface ProductInfoProps {
  name: string;
  price: number;
  taxIncluded?: boolean;
  shippingCalculated?: boolean;
  sizes: string[];
  dietIcons: DietIcon[];
  category?: string;
  categoryLink?: string;
}

export function ProductInfo({
  name,
  price,
  taxIncluded = true,
  shippingCalculated = true,
  sizes,
  dietIcons,
  category,
  categoryLink = '#'
}: ProductInfoProps) {
  const [selectedSize, setSelectedSize] = useState(sizes[0]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          {name}
        </h1>
        {category && (
          <div className="flex items-center gap-2 text-sm">
            <Link 
              href={categoryLink}
              className="flex items-center gap-1 text-teal-700 hover:underline"
            >
              <span className="w-5 h-5 flex items-center justify-center">
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                </svg>
              </span>
              <span>{category}</span>
            </Link>
          </div>
        )}
      </div>

      <div>
        <p className="text-3xl font-bold text-gray-900">₹{price}</p>
        {(taxIncluded || shippingCalculated) && (
          <p className="text-sm text-gray-500 mt-1">
            {taxIncluded && 'Tax included. '}
            {shippingCalculated && 'Shipping calculated at checkout.'}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-3">
          Size: {selectedSize}
        </label>
        <div className="flex flex-wrap gap-3">
          {sizes.map((size) => (
            <button
              key={size}
              onClick={() => setSelectedSize(size)}
              className={`w-14 h-14 rounded-full border-2 flex items-center justify-center text-sm font-medium transition-all ${
                selectedSize === size
                  ? 'border-teal-600 bg-teal-50 text-teal-700'
                  : 'border-gray-300 text-gray-700 hover:border-gray-400'
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {dietIcons.length > 0 && (
        <div className="flex gap-3">
          {dietIcons.map((icon, index) => (
            <div
              key={index}
              className="w-12 h-12 rounded-full border-2 border-gray-300 flex items-center justify-center"
              title={icon.label}
            >
              <div className={`w-8 h-8 rounded-full ${
                icon.type === 'veg' ? 'bg-green-500' :
                icon.type === 'nonveg' ? 'bg-red-500' :
                icon.type === 'gluten-free' ? 'bg-orange-500' :
                icon.type === 'halal' ? 'bg-blue-500' :
                'bg-gray-400'
              }`} />
            </div>
          ))}
        </div>
      )}

      <Button 
        className="w-full bg-teal-700 hover:bg-teal-800 text-white font-semibold py-6 text-base"
        size="lg"
      >
        <ShoppingCart className="w-5 h-5 mr-2" />
        Add to cart
      </Button>
    </div>
  );
}
