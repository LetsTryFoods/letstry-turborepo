'use client'
import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import Image from 'next/image';
import { Badge } from './Badge';
import { PriceSection } from './PriceSection';
import { WeightSelector } from './WeightSelector';
import { AddToCartButton } from './AddToCartButton';
import { CartService } from '@/lib/cart/cart-service';

import Link from 'next/link';

export interface Product {
  id: string;
  name: string;
  slug: string;
  image: string;
  price: number;
  mrp?: number;
  variants: {
    id: string;
    weight: string;
    price: number;
    mrp?: number;
  }[];
  badge?: {
    label: string;
    variant: 'trending' | 'bestseller' | 'default';
  };
}

interface ProductCardProps {
  product: Product;
  categoryType?: 'default' | 'special';
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, categoryType = 'default' }) => {
  const [selectedVariantId, setSelectedVariantId] = useState(product.variants[0]?.id || product.id);
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();
  
  const selectedVariant = product.variants.find(v => v.id === selectedVariantId) || {
    price: product.price,
    mrp: product.mrp,
    weight: product.variants[0]?.weight
  };

  const weights = product.variants.map(v => v.weight);
  const selectedWeight = selectedVariant.weight;

  const handleWeightChange = (weight: string) => {
    const variant = product.variants.find(v => v.weight === weight);
    if (variant) {
      setSelectedVariantId(variant.id);
    }
  };

  const handleAddToCart = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      await CartService.addToCart(selectedVariantId, 1);
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast.success(`${product.name} added to cart`);
    } catch (error) {
      console.error('Failed to add to cart:', error);
      toast.error('Failed to add to cart');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="border border-gray-200 rounded-sm overflow-hidden flex flex-col h-full bg-white hover:shadow-md transition-shadow duration-200 relative group">
      <Link href={`/product/${product.slug}`} className="absolute inset-0 z-10" />
      <div className="relative h-64 w-full bg-[#fdfbf7] flex items-center justify-center p-4">
        {product.badge && (
          <Badge label={product.badge.label} variant={product.badge.variant} />
        )}
        <div className="relative w-40 h-40">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-contain"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      </div>

      <div className="p-4 flex flex-col flex-grow text-center relative z-20 pointer-events-none">
        <h3 className="text-2xl font-bold text-gray-900 line-clamp-2 min-h-[3rem] flex items-center justify-center pointer-events-auto">
          <Link href={`/product/${product.slug}`}>
            {product.name}
          </Link>
        </h3>
        
        <PriceSection price={selectedVariant.price} mrp={selectedVariant.mrp} />
        
        <div className="mt-auto w-full pointer-events-auto">
            <WeightSelector
            weights={weights}
            selectedWeight={selectedWeight}
            onWeightChange={handleWeightChange}
            />
            
            <AddToCartButton onClick={handleAddToCart} />
        </div>
      </div>
    </div>
  );
};
