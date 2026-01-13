"use client";

import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';
import { CartService } from '@/lib/cart/cart-service';
import { useAnalytics } from '@/hooks/use-analytics';

interface ActionButtonsProps {
  product: {
    id: string;
    name: string;
    price: number;
    variantName?: string;
  };
  isOutOfStock?: boolean;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({ product, isOutOfStock = false }) => {
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();
  const { trackAddToCart } = useAnalytics();

  const handleAddToCart = async () => {
    if (isOutOfStock || isLoading) return;
    
    setIsLoading(true);
    try {
      await CartService.addToCart(product.id, 1);
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      
      trackAddToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        variant: product.variantName,
      });
      
      toast.success(`${product.name} added to cart`);
    } catch (error) {
      console.error('Failed to add to cart:', error);
      toast.error('Failed to add to cart');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    console.log('Buy now:', product);
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      <button
        onClick={handleAddToCart}
        disabled={isOutOfStock || isLoading}
        className={cn(
          "w-full py-1 sm:py-2 px-4 border-1 border-[#0f3455] text-[#0f3455] text-lg font-bold rounded-lg transition-colors uppercase tracking-wide",
          isOutOfStock || isLoading ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-50"
        )}
      >
        {isLoading ? 'Adding...' : isOutOfStock ? 'Out of Stock' : 'Add to cart'}
      </button>
      <button
        onClick={handleBuyNow}
        disabled={isOutOfStock}
        className={cn(
          "w-full py-2 sm:py-3 px-4 bg-[#0f3455] text-white text-lg font-bold rounded-lg transition-colors uppercase tracking-wide shadow-md",
          isOutOfStock ? "opacity-50 cursor-not-allowed" : "hover:bg-[#1a4b75]"
        )}
      >
        Buy Now
      </button>
    </div>
  );
};
